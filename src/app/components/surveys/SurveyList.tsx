import React from "react";
import {
  Search, Plus, ClipboardList, Users, Calendar, BarChart3,
  Edit3, Copy, Trash2, Send, ChevronDown, FileText,
  CheckCircle2, Clock, PauseCircle, LayoutGrid, List,
  Bell, MoreHorizontal, Eye, Archive, Tag, Filter,
} from "lucide-react";
import {
  MOCK_SURVEYS, CATEGORY_CONFIG, STATUS_CONFIG, SURVEY_TEMPLATES,
  getSurveyCompletionRate, getDaysRemaining,
  type Survey, type SurveyCategory, type SurveyStatus,
} from "./mock-data";
import { EmptyState } from "../EmptyState";
import { useConfirm } from "../ConfirmDialog";
import { toast } from "sonner";

interface SurveyListProps {
  onSelectSurvey: (id: string) => void;
  onCreateNew: () => void;
  isAdmin: boolean;
}

export function SurveyList({ onSelectSurvey, onCreateNew, isAdmin }: SurveyListProps) {
  const [search, setSearch] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState<SurveyCategory | "all">("all");
  const [filterStatus, setFilterStatus] = React.useState<SurveyStatus | "all">("all");
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = React.useState<"date" | "responses" | "rate">("date");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [actionMenuId, setActionMenuId] = React.useState<string | null>(null);
  const confirm = useConfirm();

  const filtered = React.useMemo(() => {
    let result = MOCK_SURVEYS.filter(s => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q) && !s.tags?.some(t => t.toLowerCase().includes(q))) return false;
      }
      if (filterCategory !== "all" && s.category !== filterCategory) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      return true;
    });
    // Sort
    if (sortBy === "responses") result.sort((a, b) => b.responseCount - a.responseCount);
    else if (sortBy === "rate") result.sort((a, b) => getSurveyCompletionRate(b) - getSurveyCompletionRate(a));
    return result;
  }, [search, filterCategory, filterStatus, sortBy]);

  const statusIcon = (status: SurveyStatus) => {
    switch (status) {
      case "active": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "draft": return <Edit3 className="w-3.5 h-3.5" />;
      case "closed": return <PauseCircle className="w-3.5 h-3.5" />;
      case "scheduled": return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const handleBulkAction = async (action: "remind" | "close" | "delete") => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (action === "delete") {
      const ok = await confirm({ title: `Xóa ${count} khảo sát?`, message: "Hành động này không thể hoàn tác.", confirmLabel: "Xóa", variant: "danger" });
      if (!ok) return;
    }
    if (action === "remind") toast.success(`Đã gửi nhắc nhở cho ${count} khảo sát`);
    else if (action === "close") toast.success(`Đã đóng ${count} khảo sát`);
    else toast.success(`Đã xóa ${count} khảo sát`);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm khảo sát, tag..." className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as any)} className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "12px" }}>
            <option value="all">Tất cả danh mục</option>
            {(Object.keys(CATEGORY_CONFIG) as SurveyCategory[]).map(cat => (
              <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "12px" }}>
            <option value="all">Tất cả trạng thái</option>
            {(Object.keys(STATUS_CONFIG) as SurveyStatus[]).map(st => (
              <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>
            ))}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "12px" }}>
            <option value="date">Mới nhất</option>
            <option value="responses">Nhiều phản hồi</option>
            <option value="rate">Tỷ lệ cao</option>
          </select>
          {/* View toggle */}
          <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded cursor-pointer ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}><List className="w-3.5 h-3.5 text-gray-500" /></button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded cursor-pointer ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}><LayoutGrid className="w-3.5 h-3.5 text-gray-500" /></button>
          </div>
          {isAdmin && (
            <div className="relative">
              <button onClick={() => setShowTemplates(!showTemplates)} className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                <Plus className="w-3.5 h-3.5" /> Tạo khảo sát <ChevronDown className="w-3 h-3" />
              </button>
              {showTemplates && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowTemplates(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Chọn mẫu khảo sát</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {SURVEY_TEMPLATES.map(tpl => {
                        const catCfg = CATEGORY_CONFIG[tpl.category];
                        return (
                          <button key={tpl.id} onClick={() => { setShowTemplates(false); onCreateNew(); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{tpl.name}</span>
                              <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 500, color: catCfg.color, backgroundColor: catCfg.bg }}>{catCfg.label}</span>
                            </div>
                            <p className="text-gray-400" style={{ fontSize: "11px" }}>{tpl.description}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-gray-300" style={{ fontSize: "10px" }}>
                              <span>{tpl.questionCount} câu hỏi mẫu</span>
                              {tpl.usageCount !== undefined && <span>• Đã dùng {tpl.usageCount} lần</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk actions */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-[#990803]/5 rounded-xl border border-[#990803]/10">
          <span className="text-[#990803]" style={{ fontSize: "12px", fontWeight: 600 }}>{selectedIds.size} đã chọn</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={() => handleBulkAction("remind")} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-1" style={{ fontSize: "11px" }}><Bell className="w-3 h-3" /> Nhắc nhở</button>
            <button onClick={() => handleBulkAction("close")} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-1" style={{ fontSize: "11px" }}><Archive className="w-3 h-3" /> Đóng</button>
            <button onClick={() => handleBulkAction("delete")} className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 cursor-pointer flex items-center gap-1" style={{ fontSize: "11px" }}><Trash2 className="w-3 h-3" /> Xóa</button>
            <button onClick={() => setSelectedIds(new Set())} className="px-2 py-1.5 text-gray-400 hover:text-gray-600 cursor-pointer" style={{ fontSize: "11px" }}>Bỏ chọn</button>
          </div>
        </div>
      )}

      {/* Survey list/grid */}
      {viewMode === "list" ? (
        <div className="space-y-2">
          {filtered.map(survey => (
            <SurveyListCard key={survey.id} survey={survey} onSelect={onSelectSurvey} isAdmin={isAdmin} selected={selectedIds.has(survey.id)} onToggleSelect={() => toggleSelect(survey.id)} actionMenuId={actionMenuId} setActionMenuId={setActionMenuId} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(survey => (
            <SurveyGridCard key={survey.id} survey={survey} onSelect={onSelectSurvey} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState variant={search ? "search" : "empty"} title="Không tìm thấy khảo sát nào" message={search ? `Không có kết quả cho "${search}"` : "Chưa có khảo sát nào trong danh mục này"} action={search ? { label: "Xóa bộ lọc", onClick: () => { setSearch(""); setFilterCategory("all"); setFilterStatus("all"); } } : undefined} />
      )}

      <p className="text-gray-300 text-center" style={{ fontSize: "11px" }}>Hiển thị {filtered.length}/{MOCK_SURVEYS.length} khảo sát</p>
    </div>
  );
}

/* ─── List Card ─── */
function SurveyListCard({ survey, onSelect, isAdmin, selected, onToggleSelect, actionMenuId, setActionMenuId }: {
  survey: Survey;
  onSelect: (id: string) => void;
  isAdmin: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  actionMenuId: string | null;
  setActionMenuId: (id: string | null) => void;
}) {
  const catCfg = CATEGORY_CONFIG[survey.category];
  const stCfg = STATUS_CONFIG[survey.status];
  const rate = getSurveyCompletionRate(survey);
  const daysLeft = getDaysRemaining(survey.endDate);
  const isUrgent = survey.status === "active" && daysLeft >= 0 && daysLeft <= 3;

  return (
    <div className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all group ${selected ? "border-[#990803]/40 bg-[#990803]/[0.02]" : "border-gray-200 hover:border-gray-300"}`}>
      <div className="flex items-start gap-3">
        {isAdmin && (
          <input type="checkbox" checked={selected} onChange={onToggleSelect} className="mt-1 accent-[#990803] cursor-pointer shrink-0" onClick={e => e.stopPropagation()} />
        )}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 cursor-pointer" style={{ backgroundColor: catCfg.bg }} onClick={() => onSelect(survey.id)}>
          <ClipboardList className="w-5 h-5" style={{ color: catCfg.color }} />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(survey.id)}>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-gray-800 group-hover:text-[#990803] transition-colors" style={{ fontSize: "14px", fontWeight: 600 }}>{survey.title}</span>
            <span className="px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{statusIcon(survey.status)} {stCfg.label}</span>
            <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 500, color: catCfg.color, backgroundColor: catCfg.bg }}>{catCfg.label}</span>
            {isUrgent && <span className="px-1.5 py-0.5 bg-red-50 text-red-500 rounded-full" style={{ fontSize: "9px", fontWeight: 600 }}>{daysLeft}d còn lại</span>}
            {survey.priority === "high" && <span className="px-1.5 py-0.5 bg-red-50 text-red-500 rounded-full" style={{ fontSize: "9px", fontWeight: 600 }}>Ưu tiên</span>}
          </div>
          <p className="text-gray-400 line-clamp-1" style={{ fontSize: "12px" }}>{survey.description}</p>
          <div className="flex items-center gap-4 mt-2 text-gray-400 flex-wrap" style={{ fontSize: "11px" }}>
            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {survey.questions.length} câu</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {survey.responseCount}/{survey.targetCount}</span>
            {survey.startDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {survey.startDate} — {survey.endDate}</span>}
            {survey.isAnonymous && <span className="text-purple-500">🔒 Ẩn danh</span>}
            {survey.avgCompletionMinutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{survey.avgCompletionMinutes}p</span>}
          </div>
          {/* Tags */}
          {survey.tags && survey.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <Tag className="w-3 h-3 text-gray-300" />
              {survey.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded" style={{ fontSize: "9px" }}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Completion ring */}
        <div className="shrink-0 flex flex-col items-center">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#f0f0f0" strokeWidth="4" />
            <circle cx="24" cy="24" r="20" fill="none" stroke={rate >= 80 ? "#16a34a" : rate >= 50 ? "#c8a84e" : rate >= 20 ? "#f59e0b" : "#e5e7eb"} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${rate * 1.257} 125.7`} transform="rotate(-90 24 24)" />
            <text x="24" y="26" textAnchor="middle" fill="#374151" style={{ fontSize: "11px", fontWeight: 700 }}>{rate}%</text>
          </svg>
          <span className="text-gray-300 mt-0.5" style={{ fontSize: "9px" }}>phản hồi</span>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="relative shrink-0">
            <button onClick={e => { e.stopPropagation(); setActionMenuId(actionMenuId === survey.id ? null : survey.id); }} className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {actionMenuId === survey.id && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setActionMenuId(null)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-40 py-1">
                  {[
                    { icon: Eye, label: "Xem kết quả", onClick: () => { onSelect(survey.id); setActionMenuId(null); } },
                    { icon: Copy, label: "Nhân bản", onClick: () => { toast.success("Đã nhân bản khảo sát"); setActionMenuId(null); } },
                    { icon: Bell, label: "Gửi nhắc nhở", onClick: () => { toast.success("Đã gửi nhắc nhở"); setActionMenuId(null); } },
                    { icon: Send, label: "Xuất báo cáo", onClick: () => { toast.success("Đang xuất báo cáo..."); setActionMenuId(null); } },
                    { icon: Archive, label: "Đóng khảo sát", onClick: () => { toast.success("Đã đóng khảo sát"); setActionMenuId(null); } },
                  ].map(a => (
                    <button key={a.label} onClick={a.onClick} className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px" }}>
                      <a.icon className="w-3.5 h-3.5 text-gray-400" /> {a.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  function statusIcon(status: SurveyStatus) {
    switch (status) {
      case "active": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "draft": return <Edit3 className="w-3.5 h-3.5" />;
      case "closed": return <PauseCircle className="w-3.5 h-3.5" />;
      case "scheduled": return <Clock className="w-3.5 h-3.5" />;
    }
  }
}

/* ─── Grid Card ─── */
function SurveyGridCard({ survey, onSelect }: { survey: Survey; onSelect: (id: string) => void }) {
  const catCfg = CATEGORY_CONFIG[survey.category];
  const stCfg = STATUS_CONFIG[survey.status];
  const rate = getSurveyCompletionRate(survey);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer" onClick={() => onSelect(survey.id)}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: catCfg.bg }}>
          <ClipboardList className="w-5 h-5" style={{ color: catCfg.color }} />
        </div>
        <span className="px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
      </div>
      <h3 className="text-gray-800 line-clamp-2 mb-1" style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.4 }}>{survey.title}</h3>
      <p className="text-gray-400 line-clamp-1 mb-3" style={{ fontSize: "11px" }}>{survey.description}</p>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-gray-400" style={{ fontSize: "10px" }}>{survey.responseCount}/{survey.targetCount}</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: rate >= 70 ? "#16a34a" : rate >= 40 ? "#f59e0b" : "#dc2626" }}>{rate}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: rate >= 70 ? "#16a34a" : rate >= 40 ? "#f59e0b" : "#dc2626" }} />
        </div>
      </div>

      <div className="flex items-center gap-3 text-gray-300" style={{ fontSize: "10px" }}>
        <span>{survey.questions.length} câu</span>
        {survey.avgCompletionMinutes && <span>~{survey.avgCompletionMinutes}p</span>}
        {survey.isAnonymous && <span className="text-purple-400">🔒</span>}
      </div>
    </div>
  );
}
