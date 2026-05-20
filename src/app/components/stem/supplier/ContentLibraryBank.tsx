import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  FolderOpen, Search, Plus, Eye, Download, Pencil, Copy,
  BookOpen, CheckCircle2, Clock, TrendingUp, Filter,
} from "lucide-react";
import { lessons, STEM_PROGRAMS, SCHOOL_TIERS, STUDIO_LESSONS, STEM_IMAGES } from "../../mock-data/index";
import type { StemProgram, Lesson } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  CONTENT LIBRARY BANK — Ngân hàng Nội dung (Supplier)            */
/*  Danh mục toàn bộ bài giảng đã publish, có filter + preview      */
/* ================================================================ */

import { CTSelectorWizard } from "./CTSelectorWizard";

export function ContentLibraryBank() {
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<StemProgram | "all">("all");
  const [tierFilter, setTierFilter] = useState<string | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [wizardOpen, setWizardOpen] = useState(false);

  // Hợp nhất: bài Ngân hàng (lessons[]) + bài Studio đã publish
  const enriched = useMemo(() => {
    /* Bài bank gốc */
    const bankItems = lessons.map((l, i) => ({
      ...l,
      views: 800 + (i * 137) % 4000,
      schoolsUsing: 5 + (i * 7) % 40,
      rating: 3.8 + ((i * 11) % 15) / 10,
      isPublished: i % 9 !== 0,
      source: "bank" as const,
    }));
    /* Bài Studio đã publish — normalize về shape Lesson */
    const studioItems = STUDIO_LESSONS
      .filter((d) => d.status === "published")
      .map((d, i): Lesson & { views: number; schoolsUsing: number; rating: number; isPublished: boolean; source: "studio" } => ({
        id: d.id,
        title: d.title,
        description: `Bài giảng tự biên soạn từ Studio — ${d.subject}, ${d.grade}.`,
        programCode: d.program,
        gradeLevel: d.grade,
        subject: d.subject,
        durationMinutes: d.durationMinutes,
        resourceUrls: [],
        thumbnail: STEM_IMAGES[i % STEM_IMAGES.length],
        createdBy: "NCC Studio",
        createdAt: new Date().toISOString(),
        views: 120 + (i * 53) % 800,
        schoolsUsing: 1 + (i * 3) % 12,
        rating: 4.0 + ((i * 7) % 10) / 10,
        isPublished: true,
        source: "studio",
      }));
    return [...bankItems, ...studioItems];
  }, []);

  const filtered = useMemo(() => enriched.filter((l) => {
    if (programFilter !== "all" && l.programCode !== programFilter) return false;
    if (tierFilter !== "all" && !l.gradeLevel.toLowerCase().includes(tierFilter.toLowerCase())) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.title.toLowerCase().includes(q) && !l.subject.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [enriched, programFilter, tierFilter, search]);

  const totalViews = enriched.reduce((s, l) => s + l.views, 0);
  const publishedCount = enriched.filter((l) => l.isPublished).length;
  const sgkMapped = enriched.filter((l) => l.sgkMapping).length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FolderOpen}
        title="Ngân hàng Nội dung"
        subtitle="Kho tài nguyên học tập phân loại theo 5 chương trình STEM (CT1–CT5), gắn kết với SGK Bộ GD&ĐT."
        accentColor="#990803"
        actions={
          <>
            <button onClick={() => toast.info("Nhập nội dung từ file ZIP / SCORM")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Nhập nội dung
            </button>
            <button onClick={() => setWizardOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Soạn bài mới
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={BookOpen} label="Tổng bài giảng" value={enriched.length} color="#990803" />
        <KpiCard icon={CheckCircle2} label="Đã publish" value={publishedCount} color="#16a34a" subtitle={`${Math.round(publishedCount / enriched.length * 100)}% sẵn sàng`} />
        <KpiCard icon={TrendingUp} label="Lượt xem (QTD)" value={totalViews.toLocaleString()} color="#c8a84e" change="+18%" trend="up" />
        <KpiCard icon={Filter} label="Mapping SGK" value={`${sgkMapped}/${enriched.length}`} color="#2563eb" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bài giảng, bộ môn..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <button onClick={() => setProgramFilter("all")}
          className={`px-3 py-2 rounded-lg border ${programFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả CT
        </button>
        {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((code) => {
          const p = STEM_PROGRAMS[code];
          const count = enriched.filter((l) => l.programCode === code).length;
          const active = programFilter === code;
          return (
            <button key={code} onClick={() => setProgramFilter(code)}
              className={`px-3 py-2 rounded-lg border ${active ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(active ? { backgroundColor: p.color } : {}),
              }}>
              {code} ({count})
            </button>
          );
        })}
        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả cấp</option>
          {SCHOOL_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <button onClick={() => setView("grid")}
            className={`px-2 py-1 rounded ${view === "grid" ? "bg-secondary" : ""}`}
            style={{ fontSize: "11px" }}>Grid</button>
          <button onClick={() => setView("list")}
            className={`px-2 py-1 rounded ${view === "list" ? "bg-secondary" : ""}`}
            style={{ fontSize: "11px" }}>List</button>
        </div>
      </div>

      <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
        Hiển thị {filtered.length}/{enriched.length} bài giảng
      </p>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.slice(0, 24).map((l) => (
            <div key={l.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all group">
              <div className="h-32 relative overflow-hidden">
                <img src={l.thumbnail} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <ProgramBadge code={l.programCode} size="md" />
                  {l.sgkMapping && (
                    <span className="px-2 py-0.5 bg-white/90 text-[#2563eb] rounded" style={{ fontSize: "10px", fontWeight: 700 }}>
                      SGK
                    </span>
                  )}
                  {l.source === "studio" && (
                    <span className="px-2 py-0.5 bg-[#7c3aed] text-white rounded" style={{ fontSize: "10px", fontWeight: 700 }}>
                      Studio
                    </span>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  {l.isPublished ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#16a34a] text-white rounded" style={{ fontSize: "9px", fontWeight: 700 }}>
                      <CheckCircle2 className="w-2.5 h-2.5" /> LIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#f59e0b] text-white rounded" style={{ fontSize: "9px", fontWeight: 700 }}>
                      <Clock className="w-2.5 h-2.5" /> NHÁP
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-foreground line-clamp-2" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {l.title}
                </h3>
                <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "11.5px" }}>
                  {l.description}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-muted-foreground" style={{ fontSize: "10.5px" }}>
                  <span className="px-1.5 py-0.5 bg-secondary rounded">{l.subject}</span>
                  <span className="px-1.5 py-0.5 bg-secondary rounded">{l.gradeLevel}</span>
                  <span className="px-1.5 py-0.5 bg-secondary rounded">{l.durationMinutes}p</span>
                </div>
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-1 text-center">
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: "9.5px" }}>Views</p>
                    <p style={{ fontSize: "12px", fontWeight: 700 }}>{(l.views / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: "9.5px" }}>Trường</p>
                    <p style={{ fontSize: "12px", fontWeight: 700 }}>{l.schoolsUsing}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: "9.5px" }}>Rating</p>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#c8a84e" }}>
                      {l.rating.toFixed(1)}★
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex gap-1">
                  <Link to={`/supplier/content/library/${l.id}`}
                    className="flex-1 px-2 py-1.5 border border-border rounded hover:bg-secondary flex items-center justify-center gap-1"
                    style={{ fontSize: "11px", fontWeight: 500 }}>
                    <Eye className="w-3 h-3" /> Xem
                  </Link>
                  <Link to={`/supplier/content/library/${l.id}`}
                    className="flex-1 px-2 py-1.5 bg-[#990803] text-white rounded hover:opacity-90 flex items-center justify-center gap-1"
                    style={{ fontSize: "11px", fontWeight: 500 }}>
                    <Pencil className="w-3 h-3" /> Sửa
                  </Link>
                  <button onClick={() => toast.success("Đã duplicate bài giảng")}
                    className="px-2 py-1.5 border border-border rounded hover:bg-secondary" title="Duplicate">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">Bài giảng</th>
                <th className="px-4 py-2.5">CT</th>
                <th className="px-4 py-2.5">Cấp</th>
                <th className="px-4 py-2.5">Thời lượng</th>
                <th className="px-4 py-2.5">Views</th>
                <th className="px-4 py-2.5">Trường dùng</th>
                <th className="px-4 py-2.5">Rating</th>
                <th className="px-4 py-2.5">Cập nhật</th>
                <th className="px-4 py-2.5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
              {filtered.slice(0, 30).map((l) => (
                <tr key={l.id} className="hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <p style={{ fontWeight: 500 }}>{l.title}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{l.subject}</p>
                  </td>
                  <td className="px-4 py-3"><ProgramBadge code={l.programCode} size="xs" /></td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>{l.gradeLevel}</td>
                  <td className="px-4 py-3">{l.durationMinutes}p</td>
                  <td className="px-4 py-3">{l.views.toLocaleString()}</td>
                  <td className="px-4 py-3">{l.schoolsUsing}</td>
                  <td className="px-4 py-3 text-[#c8a84e]" style={{ fontWeight: 600 }}>{l.rating.toFixed(1)}★</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11px" }}>{formatRelative(l.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/supplier/content/library/${l.id}`}
                      className="inline-block p-1.5 hover:bg-secondary rounded">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <Link to={`/supplier/content/library/${l.id}`}
                      className="inline-block p-1.5 hover:bg-secondary rounded ml-1">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CTSelectorWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}

export default ContentLibraryBank;
