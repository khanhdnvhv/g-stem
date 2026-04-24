import { useState } from "react";
import {
  Search, Star, Clock, BookOpen, Users, Copy, Eye, Sparkles,
  ArrowRight, Filter, ChevronDown, TrendingUp,
} from "lucide-react";
import { mockTemplates } from "./mock-data";

export function PathTemplates({ onUseTemplate }: { onUseTemplate?: (templateId: string) => void }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categories = [...new Set(mockTemplates.map(t => t.category))];

  const filtered = mockTemplates.filter(t => {
    const ms = search.toLowerCase();
    const matchSearch = !ms || t.title.toLowerCase().includes(ms) || t.description.toLowerCase().includes(ms);
    const matchCat = categoryFilter === "all" || t.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const selected = selectedTemplate ? mockTemplates.find(t => t.id === selectedTemplate) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/10 rounded-xl border border-[#c8a84e]/20 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#c8a84e]" />
          <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Thư viện Template</h3>
        </div>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
          Sử dụng template có sẵn để nhanh chóng tạo lộ trình đào tạo chuẩn hóa cho Tập đoàn.
          Template được xây dựng dựa trên best practices và kinh nghiệm thực tế.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Tìm template..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
          <option value="all">Tất cả danh mục</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Template Grid */}
        <div className={`${selected ? "lg:col-span-2" : "lg:col-span-3"} grid grid-cols-1 sm:grid-cols-2 ${selected ? "" : "lg:grid-cols-3"} gap-4`}>
          {filtered.map(tpl => (
            <div
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl.id)}
              className={`bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                selectedTemplate === tpl.id ? "border-[#990803] ring-2 ring-[#990803]/20" : "border-border"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span style={{ fontSize: "32px" }}>{tpl.icon}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#c8a84e] fill-[#c8a84e]" />
                    <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{tpl.rating}</span>
                  </div>
                </div>
                <h4 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{tpl.title}</h4>
                <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "12px" }}>{tpl.description}</p>

                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                    <BookOpen className="w-3 h-3" /> {tpl.courseCount} khóa
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                    <Clock className="w-3 h-3" /> {tpl.estimatedWeeks} tuần
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                    <Users className="w-3 h-3" /> {tpl.usageCount}x
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {tpl.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10px" }}>{t}</span>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={e => { e.stopPropagation(); onUseTemplate?.(tpl.id); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                    style={{ fontSize: "12px", fontWeight: 500 }}>
                    <Copy className="w-3.5 h-3.5" /> Sử dụng
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedTemplate(tpl.id); }}
                    className="px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                    style={{ fontSize: "12px" }}>
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="bg-card rounded-xl border border-border p-5 sticky top-4 self-start">
            <div className="text-center mb-4">
              <span style={{ fontSize: "48px" }}>{selected.icon}</span>
              <h3 className="text-foreground mt-2" style={{ fontSize: "16px", fontWeight: 600 }}>{selected.title}</h3>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>{selected.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{selected.courseCount}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Khóa học</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{selected.estimatedWeeks}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Tuần</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{selected.usageCount}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Lần sử dụng</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-[#c8a84e]" style={{ fontSize: "18px", fontWeight: 700 }}>★ {selected.rating}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Đánh giá</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 500 }}>CẤP ĐỘ</p>
              <span className="px-3 py-1 rounded bg-[#990803]/10 text-[#990803]" style={{ fontSize: "12px", fontWeight: 500 }}>
                {selected.level}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 500 }}>TAGS</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "11px" }}>{t}</span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 500 }}>ĐỘ PHỔ BIẾN</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600" style={{ fontSize: "12px", fontWeight: 500 }}>
                  Top {Math.round((1 - (mockTemplates.indexOf(selected) / mockTemplates.length)) * 100)}%
                </span>
              </div>
            </div>

            <button
              onClick={() => onUseTemplate?.(selected.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Copy className="w-4 h-4" /> Sử dụng Template này
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="mt-3 text-foreground" style={{ fontSize: "15px", fontWeight: 500 }}>Không tìm thấy template</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
}
