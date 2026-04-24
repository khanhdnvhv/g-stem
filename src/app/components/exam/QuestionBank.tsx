import { useState, useMemo, useRef, useCallback } from "react";
import {
  Plus, Search, Filter, Trash2, PenLine, Copy, Download, Upload,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, X, Eye, EyeOff,
  Tag, Hash, Target, Clock, Lightbulb, FileText, BarChart3,
  ArrowUpDown, Layers, Brain, Sparkles, FileSpreadsheet,
  ChevronLeft, ChevronRight, MoreHorizontal, Check, AlertCircle,
  GripVertical, Settings, Archive, Star, Bookmark, Link2,
} from "lucide-react";
import type { ExamQuestion, QuestionType, DifficultyLevel } from "./types";
import { QUESTION_BANK, QUESTION_TYPE_CONFIG, DIFFICULTY_CONFIG } from "./types";
import { useConfirm } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";

// ─── AI Question Generator (mock) ───
const AI_SUGGESTIONS = [
  "Phân tích ưu nhược điểm của mô hình OKR so với KPI trong bối cảnh tập đoàn đa ngành?",
  "Trong quản trị rủi ro, ma trận Risk Assessment 5x5 được sử dụng như thế nào?",
  "So sánh phong cách lãnh đạo Transformational và Transactional trong bối cảnh chuyển đổi số",
  "Các bước triển khai ESG framework cho doanh nghiệp sản xuất tại Việt Nam?",
];

export function QuestionBank() {
  const [questions, setQuestions] = useState<ExamQuestion[]>([...QUESTION_BANK]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDiff, setFilterDiff] = useState<string>("all");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "difficulty" | "points" | "type">("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showEditor, setShowEditor] = useState(false);
  const [editingQ, setEditingQ] = useState<ExamQuestion | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showAIGen, setShowAIGen] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirmDialog = useConfirm();

  // ── Categories from questions ──
  const categories = useMemo(() => [...new Set(questions.map(q => q.category))].sort(), [questions]);
  const allTags = useMemo(() => [...new Set(questions.flatMap(q => q.tags))].sort(), [questions]);

  // ── Filter & Sort ──
  const filtered = useMemo(() => {
    let list = questions.filter(q => {
      const matchSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) || q.tags.some(t => t.includes(searchQuery.toLowerCase()));
      const matchType = filterType === "all" || q.type === filterType;
      const matchDiff = filterDiff === "all" || q.difficulty === filterDiff;
      const matchCat = filterCat === "all" || q.category === filterCat;
      return matchSearch && matchType && matchDiff && matchCat;
    });
    list.sort((a, b) => {
      if (sortBy === "difficulty") return ["easy", "medium", "hard", "expert"].indexOf(a.difficulty) - ["easy", "medium", "hard", "expert"].indexOf(b.difficulty);
      if (sortBy === "points") return b.points - a.points;
      if (sortBy === "type") return a.type.localeCompare(b.type);
      return 0;
    });
    return list;
  }, [questions, searchQuery, filterType, filterDiff, filterCat, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // ── Stats ──
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    const byDiff: Record<string, number> = {};
    questions.forEach(q => {
      byType[q.type] = (byType[q.type] || 0) + 1;
      byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1;
    });
    return { total: questions.length, byType, byDiff, totalPoints: questions.reduce((s, q) => s + q.points, 0) };
  }, [questions]);

  // ── Selection ──
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(q => q.id)));
  };

  // ── CRUD ──
  const deleteSelected = async () => {
    const count = selectedIds.size;
    const ok = await confirmDialog({
      title: `Xóa ${count} câu hỏi?`,
      message: `Bạn có chắc muốn xóa ${count} câu hỏi đã chọn khỏi ngân hàng? Các đề thi đã sử dụng câu hỏi này sẽ không bị ảnh hưởng.`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setQuestions(prev => prev.filter(q => !selectedIds.has(q.id)));
      setSelectedIds(new Set());
      import("sonner").then(m => m.toast.success(`Đã xóa ${count} câu hỏi`));
    }
  };

  const duplicateQuestion = (q: ExamQuestion) => {
    const newQ: ExamQuestion = { ...q, id: `EQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, question: `[Bản sao] ${q.question}` };
    setQuestions(prev => [newQ, ...prev]);
  };

  const deleteQuestion = async (id: string) => {
    const q = questions.find(q => q.id === id);
    const ok = await confirmDialog({
      title: "Xóa câu hỏi?",
      message: `Bạn có chắc muốn xóa câu hỏi "${q?.question.slice(0, 60) || ""}..."?`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      if (expandedQ === id) setExpandedQ(null);
      import("sonner").then(m => m.toast.success("Đã xóa câu hỏi"));
    }
  };

  // ── Import CSV ──
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length < 2) return;

      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, "").toLowerCase());
      const qIdx = headers.indexOf("question") !== -1 ? headers.indexOf("question") : headers.indexOf("câu hỏi");
      const tIdx = headers.indexOf("type") !== -1 ? headers.indexOf("type") : headers.indexOf("loại");
      const dIdx = headers.indexOf("difficulty") !== -1 ? headers.indexOf("difficulty") : headers.indexOf("độ khó");
      const pIdx = headers.indexOf("points") !== -1 ? headers.indexOf("points") : headers.indexOf("điểm");
      const catIdx = headers.indexOf("category") !== -1 ? headers.indexOf("category") : headers.indexOf("danh mục");
      const oIdx = headers.indexOf("options") !== -1 ? headers.indexOf("options") : headers.indexOf("đáp án");
      const cIdx = headers.indexOf("correct") !== -1 ? headers.indexOf("correct") : headers.indexOf("đáp án đúng");
      const eIdx = headers.indexOf("explanation") !== -1 ? headers.indexOf("explanation") : headers.indexOf("giải thích");

      const imported: ExamQuestion[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        const question = qIdx >= 0 ? cols[qIdx] : "";
        if (!question) continue;

        const type = (tIdx >= 0 ? cols[tIdx] : "single_choice") as QuestionType;
        const difficulty = (dIdx >= 0 ? cols[dIdx] : "medium") as DifficultyLevel;
        const points = pIdx >= 0 ? parseInt(cols[pIdx]) || 2 : 2;
        const category = catIdx >= 0 ? cols[catIdx] : "Chung";
        const optionsRaw = oIdx >= 0 ? cols[oIdx] : "";
        const correctRaw = cIdx >= 0 ? cols[cIdx] : "0";
        const explanation = eIdx >= 0 ? cols[eIdx] : "";

        imported.push({
          id: `IMP-${Date.now()}-${i}`,
          type: ["single_choice", "multiple_choice", "true_false", "fill_blank", "short_answer"].includes(type) ? type : "single_choice",
          question,
          difficulty,
          points,
          category,
          tags: ["imported"],
          timeEstimate: 60,
          options: optionsRaw ? optionsRaw.split("|").map(o => o.trim()) : undefined,
          correctAnswers: correctRaw ? correctRaw.split("|").map(n => parseInt(n.trim())).filter(n => !isNaN(n)) : undefined,
          explanation: explanation || undefined,
        });
      }

      if (imported.length > 0) {
        setQuestions(prev => [...imported, ...prev]);
        setShowImport(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const exportList = selectedIds.size > 0 ? questions.filter(q => selectedIds.has(q.id)) : questions;
    const BOM = "\uFEFF";
    const headers = ["ID", "Question", "Type", "Difficulty", "Points", "Category", "Tags", "Options", "Correct", "Explanation"];
    const rows = exportList.map(q => [
      q.id, q.question, q.type, q.difficulty, q.points, q.category,
      q.tags.join("|"),
      (q.options || []).join("|"),
      (q.correctAnswers || []).join("|"),
      q.explanation || "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = BOM + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Geleximco_QuestionBank_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Editor state ──
  const [edForm, setEdForm] = useState<Partial<ExamQuestion>>({});

  const openEditor = (q?: ExamQuestion) => {
    if (q) {
      setEditingQ(q);
      setEdForm({ ...q });
    } else {
      setEditingQ(null);
      setEdForm({
        type: "single_choice", difficulty: "medium", points: 2, category: "",
        tags: [], timeEstimate: 60, question: "", options: ["", "", "", ""],
        correctAnswers: [], explanation: "", hint: "",
      });
    }
    setShowEditor(true);
  };

  const saveQuestion = () => {
    if (!edForm.question?.trim()) return;
    const q: ExamQuestion = {
      id: editingQ?.id || `EQ-${Date.now()}`,
      type: edForm.type || "single_choice",
      question: edForm.question || "",
      hint: edForm.hint,
      difficulty: edForm.difficulty || "medium",
      points: edForm.points || 2,
      category: edForm.category || "Chung",
      tags: edForm.tags || [],
      timeEstimate: edForm.timeEstimate || 60,
      options: edForm.options?.filter(o => o.trim()),
      correctAnswers: edForm.correctAnswers,
      explanation: edForm.explanation,
      blanks: edForm.blanks,
      matchingPairs: edForm.matchingPairs,
      orderItems: edForm.orderItems,
      correctOrder: edForm.correctOrder,
    };
    if (editingQ) {
      setQuestions(prev => prev.map(pq => pq.id === editingQ.id ? q : pq));
    } else {
      setQuestions(prev => [q, ...prev]);
    }
    setShowEditor(false);
    setEdForm({});
    setEditingQ(null);
  };

  return (
    <div className="space-y-5">
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#990803]/10 flex items-center justify-center"><Layers className="w-4 h-4 text-[#990803]" /></div>
            <span className="text-gray-400" style={{ fontSize: "11px" }}>Tổng câu hỏi</span>
          </div>
          <p className="text-gray-800" style={{ fontSize: "24px", fontWeight: 800 }}>{stats.total}</p>
          <div className="flex gap-1 mt-1">
            {Object.entries(stats.byType).slice(0, 4).map(([type, count]) => {
              const tc = QUESTION_TYPE_CONFIG[type as QuestionType];
              return <span key={type} className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: tc?.color, background: tc?.color + "15" }}>{tc?.icon} {count}</span>;
            })}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#c8a84e]/10 flex items-center justify-center"><Target className="w-4 h-4 text-[#c8a84e]" /></div>
            <span className="text-gray-400" style={{ fontSize: "11px" }}>Tổng điểm</span>
          </div>
          <p className="text-gray-800" style={{ fontSize: "24px", fontWeight: 800 }}>{stats.totalPoints}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Tag className="w-4 h-4 text-blue-500" /></div>
            <span className="text-gray-400" style={{ fontSize: "11px" }}>Danh mục</span>
          </div>
          <p className="text-gray-800" style={{ fontSize: "24px", fontWeight: 800 }}>{categories.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-purple-500" /></div>
            <span className="text-gray-400" style={{ fontSize: "11px" }}>Phân bổ độ khó</span>
          </div>
          <div className="flex items-end gap-1 h-7 mt-1">
            {(["easy", "medium", "hard", "expert"] as DifficultyLevel[]).map(d => {
              const dc = DIFFICULTY_CONFIG[d];
              const count = stats.byDiff[d] || 0;
              const maxCount = Math.max(...Object.values(stats.byDiff), 1);
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-0.5" title={`${dc.label}: ${count}`}>
                  <div className="w-full rounded-t" style={{ height: `${Math.max(4, (count / maxCount) * 100)}%`, background: dc.color, minHeight: 3 }} />
                  <span style={{ fontSize: "7px", color: dc.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm câu hỏi, tag..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:border-[#990803]/30 focus:outline-none" style={{ fontSize: "13px" }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "11px" }}>
              <option value="all">Loại câu hỏi</option>
              {Object.entries(QUESTION_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <select value={filterDiff} onChange={(e) => { setFilterDiff(e.target.value); setPage(1); }} className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "11px" }}>
              <option value="all">Độ khó</option>
              {Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1); }} className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "11px" }}>
              <option value="all">Danh mục</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => openEditor()} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg hover:shadow-[#990803]/20 cursor-pointer transition-all" style={{ fontSize: "12px", fontWeight: 600 }}>
              <Plus className="w-3.5 h-3.5" /> Tạo câu hỏi
            </button>
            <button onClick={() => setShowAIGen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#c8a84e]/10 text-[#8a7235] rounded-xl hover:bg-[#c8a84e]/20 cursor-pointer transition-all border border-[#c8a84e]/20" style={{ fontSize: "12px", fontWeight: 500 }}>
              <Sparkles className="w-3.5 h-3.5" /> AI Generate
            </button>
            <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
              <Upload className="w-3.5 h-3.5" /> Import CSV
            </button>
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400" style={{ fontSize: "11px" }}>{selectedIds.size} đã chọn</span>
              <button onClick={deleteSelected} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}>
                <Trash2 className="w-3 h-3" /> Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Question List ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
          <input type="checkbox" checked={selectedIds.size === paginated.length && paginated.length > 0} onChange={selectAll} className="w-4 h-4 rounded border-gray-300 accent-[#990803] cursor-pointer" />
          <span className="flex-1 text-gray-500" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>CÂU HỎI</span>
          <span className="w-20 text-center text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>LOẠI</span>
          <span className="w-20 text-center text-gray-500 hidden sm:block" style={{ fontSize: "10px", fontWeight: 600 }}>ĐỘ KHÓ</span>
          <span className="w-12 text-center text-gray-500 hidden sm:block" style={{ fontSize: "10px", fontWeight: 600 }}>ĐIỂM</span>
          <span className="w-32 text-gray-500 hidden lg:block" style={{ fontSize: "10px", fontWeight: 600 }}>DANH MỤC</span>
          <span className="w-20" />
        </div>

        {paginated.map(q => {
          const tc = QUESTION_TYPE_CONFIG[q.type];
          const dc = DIFFICULTY_CONFIG[q.difficulty];
          const isExpanded = expandedQ === q.id;
          return (
            <div key={q.id} className={`border-b border-gray-50 last:border-0 ${selectedIds.has(q.id) ? "bg-[#990803]/3" : ""}`}>
              <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <input type="checkbox" checked={selectedIds.has(q.id)} onChange={() => toggleSelect(q.id)} className="w-4 h-4 rounded border-gray-300 accent-[#990803] cursor-pointer shrink-0" />
                <button onClick={() => setExpandedQ(isExpanded ? null : q.id)} className="flex-1 text-left min-w-0 cursor-pointer">
                  <p className="text-gray-700 truncate" style={{ fontSize: "13px", fontWeight: 500 }}>{q.question}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {q.tags.slice(0, 3).map(t => <span key={t} className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-400" style={{ fontSize: "9px" }}>#{t}</span>)}
                  </div>
                </button>
                <span className="w-20 text-center shrink-0">
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: tc.color, background: tc.color + "15" }}>{tc.icon} {tc.label}</span>
                </span>
                <span className="w-20 text-center shrink-0 hidden sm:block">
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: dc.color, background: dc.bg }}>{"★".repeat(dc.stars)}</span>
                </span>
                <span className="w-12 text-center text-gray-600 shrink-0 hidden sm:block" style={{ fontSize: "12px", fontWeight: 700 }}>{q.points}</span>
                <span className="w-32 text-gray-400 truncate shrink-0 hidden lg:block" style={{ fontSize: "11px" }}>{q.category}</span>
                <div className="w-20 flex items-center gap-0.5 justify-end shrink-0">
                  <button onClick={() => openEditor(q)} className="p-1.5 text-gray-400 hover:text-[#990803] hover:bg-gray-100 rounded-lg cursor-pointer" title="Sửa">
                    <PenLine className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => duplicateQuestion(q)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer" title="Nhân bản">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteQuestion(q.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" title="Xóa">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-14 pb-4 space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600" style={{ fontSize: "13px", lineHeight: 1.6 }}>{q.question}</p>
                  </div>
                  {q.options && (
                    <div className="space-y-1">
                      <p className="text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>ĐÁP ÁN</p>
                      {q.options.map((opt, idx) => (
                        <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${q.correctAnswers?.includes(idx) ? "bg-green-50 border border-green-200" : "bg-white border border-gray-100"}`}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${q.correctAnswers?.includes(idx) ? "bg-green-500" : "bg-gray-200"}`}>
                            {q.correctAnswers?.includes(idx) ? <Check className="w-3 h-3 text-white" /> : <span className="text-gray-400" style={{ fontSize: "9px" }}>{String.fromCharCode(65 + idx)}</span>}
                          </div>
                          <span style={{ fontSize: "12px" }} className={q.correctAnswers?.includes(idx) ? "text-green-700" : "text-gray-600"}>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-3 h-3 text-blue-500" />
                        <span className="text-blue-600" style={{ fontSize: "10px", fontWeight: 600 }}>Giải thích</span>
                      </div>
                      <p className="text-blue-700" style={{ fontSize: "12px", lineHeight: 1.5 }}>{q.explanation}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "10px" }}>
                    <span>⏱️ Est: {q.timeEstimate}s</span>
                    <span>🏷️ {q.tags.join(", ")}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {paginated.length === 0 && (
          <EmptyState
            variant="search"
            title="Không tìm thấy câu hỏi"
            message={searchQuery ? `Không có kết quả cho "${searchQuery}"` : "Không có câu hỏi nào phù hợp với bộ lọc hiện tại."}
            action={{ label: "Xóa bộ lọc", onClick: () => { setSearchQuery(""); setFilterType("all"); setFilterDiff("all"); setFilterCat("all"); } }}
          />
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-gray-400" style={{ fontSize: "12px" }}>Hiển thị {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} / {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              if (pg < 1 || pg > totalPages) return null;
              return (
                <button key={pg} onClick={() => setPage(pg)} className={`w-9 h-9 rounded-lg cursor-pointer ${pg === page ? "bg-[#990803] text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-600"}`} style={{ fontSize: "12px", fontWeight: 500 }}>{pg}</button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* ── QUESTION EDITOR MODAL ── */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowEditor(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10 flex items-center justify-between">
              <h2 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 600 }}>{editingQ ? "Sửa câu hỏi" : "Tạo câu hỏi mới"}</h2>
              <button onClick={() => setShowEditor(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 600 }}>Loại câu hỏi</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {(["single_choice", "multiple_choice", "true_false", "fill_blank", "short_answer", "matching", "ordering", "case_study"] as QuestionType[]).map(type => {
                    const tc = QUESTION_TYPE_CONFIG[type];
                    return (
                      <button key={type} onClick={() => setEdForm(prev => ({ ...prev, type }))}
                        className={`px-2 py-2 rounded-lg border text-center cursor-pointer transition-all ${edForm.type === type ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300"}`}
                        style={{ fontSize: "10px", fontWeight: 500 }}>
                        <span style={{ color: tc.color }}>{tc.icon}</span> {tc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Question text */}
              <div>
                <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 600 }}>Nội dung câu hỏi *</label>
                <textarea value={edForm.question || ""} onChange={(e) => setEdForm(prev => ({ ...prev, question: e.target.value }))}
                  rows={3} placeholder="Nhập câu hỏi..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#990803] focus:ring-2 focus:ring-[#990803]/10 resize-y"
                  style={{ fontSize: "14px", lineHeight: 1.6 }} />
              </div>
              {/* Options (for choice types) */}
              {(edForm.type === "single_choice" || edForm.type === "multiple_choice" || edForm.type === "true_false") && (
                <div>
                  <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 600 }}>Đáp án</label>
                  <div className="space-y-2">
                    {(edForm.options || ["", "", "", ""]).map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <button onClick={() => {
                          if (edForm.type === "single_choice" || edForm.type === "true_false") {
                            setEdForm(prev => ({ ...prev, correctAnswers: [idx] }));
                          } else {
                            const cur = edForm.correctAnswers || [];
                            setEdForm(prev => ({ ...prev, correctAnswers: cur.includes(idx) ? cur.filter(i => i !== idx) : [...cur, idx] }));
                          }
                        }}
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${edForm.correctAnswers?.includes(idx) ? "border-green-500 bg-green-500" : "border-gray-300 hover:border-green-300"}`}>
                          {edForm.correctAnswers?.includes(idx) && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <input type="text" value={opt} onChange={(e) => {
                          const opts = [...(edForm.options || [])];
                          opts[idx] = e.target.value;
                          setEdForm(prev => ({ ...prev, options: opts }));
                        }}
                          placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#990803]" style={{ fontSize: "13px" }} />
                        {(edForm.options || []).length > 2 && (
                          <button onClick={() => {
                            const opts = [...(edForm.options || [])];
                            opts.splice(idx, 1);
                            setEdForm(prev => ({ ...prev, options: opts, correctAnswers: (prev.correctAnswers || []).filter(i => i !== idx).map(i => i > idx ? i - 1 : i) }));
                          }} className="p-1.5 text-gray-300 hover:text-red-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setEdForm(prev => ({ ...prev, options: [...(prev.options || []), ""] }))}
                      className="flex items-center gap-1 text-[#990803] hover:underline cursor-pointer" style={{ fontSize: "12px" }}>
                      <Plus className="w-3 h-3" /> Thêm đáp án
                    </button>
                  </div>
                </div>
              )}
              {/* Metadata row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-gray-600 mb-1 block" style={{ fontSize: "11px", fontWeight: 600 }}>Độ khó</label>
                  <select value={edForm.difficulty || "medium"} onChange={(e) => setEdForm(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>
                    {Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-600 mb-1 block" style={{ fontSize: "11px", fontWeight: 600 }}>Điểm</label>
                  <input type="number" value={edForm.points || 2} onChange={(e) => setEdForm(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg" style={{ fontSize: "12px" }} min={1} max={50} />
                </div>
                <div>
                  <label className="text-gray-600 mb-1 block" style={{ fontSize: "11px", fontWeight: 600 }}>Danh mục</label>
                  <input type="text" value={edForm.category || ""} onChange={(e) => setEdForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ví dụ: Kỹ năng Lãnh đạo" list="categories"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg" style={{ fontSize: "12px" }} />
                  <datalist id="categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div>
                  <label className="text-gray-600 mb-1 block" style={{ fontSize: "11px", fontWeight: 600 }}>Thời gian (giây)</label>
                  <input type="number" value={edForm.timeEstimate || 60} onChange={(e) => setEdForm(prev => ({ ...prev, timeEstimate: parseInt(e.target.value) || 60 }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg" style={{ fontSize: "12px" }} />
                </div>
              </div>
              {/* Tags */}
              <div>
                <label className="text-gray-600 mb-1 block" style={{ fontSize: "11px", fontWeight: 600 }}>Tags (phân cách bằng dấu phẩy)</label>
                <input type="text" value={(edForm.tags || []).join(", ")} onChange={(e) => setEdForm(prev => ({ ...prev, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))}
                  placeholder="leadership, strategy, geleximco" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg" style={{ fontSize: "12px" }} />
              </div>
              {/* Explanation */}
              <div>
                <label className="text-gray-600 mb-1 block" style={{ fontSize: "11px", fontWeight: 600 }}>Giải thích đáp án</label>
                <textarea value={edForm.explanation || ""} onChange={(e) => setEdForm(prev => ({ ...prev, explanation: e.target.value }))}
                  rows={2} placeholder="Giải thích tại sao đáp án đúng..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#990803] resize-y" style={{ fontSize: "12px" }} />
              </div>
              {/* Hint */}
              <div>
                <label className="text-gray-600 mb-1 block" style={{ fontSize: "11px", fontWeight: 600 }}>Gợi ý (tùy chọn)</label>
                <input type="text" value={edForm.hint || ""} onChange={(e) => setEdForm(prev => ({ ...prev, hint: e.target.value }))}
                  placeholder="Gợi ý cho học viên..." className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg" style={{ fontSize: "12px" }} />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowEditor(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer" style={{ fontSize: "14px" }}>Hủy</button>
              <button onClick={saveQuestion} disabled={!edForm.question?.trim()}
                className="px-6 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] disabled:opacity-40 cursor-pointer" style={{ fontSize: "14px", fontWeight: 600 }}>
                {editingQ ? "Lưu thay đổi" : "Tạo câu hỏi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── IMPORT CSV MODAL ── */}
      {showImport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowImport(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-gray-800 mb-4" style={{ fontSize: "16px", fontWeight: 600 }}>Import câu hỏi từ CSV/Excel</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#990803]/30 transition-colors">
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-1" style={{ fontSize: "14px", fontWeight: 500 }}>Kéo thả file hoặc nhấp để chọn</p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>Hỗ trợ: .csv, .xlsx (max 5MB)</p>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileImport} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="mt-3 px-4 py-2 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Chọn file
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Cấu trúc CSV mẫu:</p>
                <code className="text-gray-500 block whitespace-pre-wrap" style={{ fontSize: "10px", lineHeight: 1.6 }}>
{`Question,Type,Difficulty,Points,Category,Options,Correct,Explanation
"Câu hỏi 1?",single_choice,medium,2,Leadership,"A|B|C|D",1,"Giải thích"
"Câu hỏi 2?",true_false,easy,1,Safety,"Đúng|Sai",0,"Giải thích"`}
                </code>
                <button onClick={() => { import("sonner").then(m => m.toast.success("Đang tải template CSV mẫu...")); }} className="mt-2 flex items-center gap-1 text-[#990803] cursor-pointer" style={{ fontSize: "11px" }}>
                  <Download className="w-3 h-3" /> Tải template CSV mẫu
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowImport(false)} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer" style={{ fontSize: "13px" }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI GENERATE MODAL ── */}
      {showAIGen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAIGen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c8a84e] to-[#8a7235] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 600 }}>AI Tạo câu hỏi tự động</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-gray-600 mb-1 block" style={{ fontSize: "11px", fontWeight: 600 }}>Chủ đề / Yêu cầu</label>
                <textarea rows={3} placeholder="Ví dụ: Tạo 10 câu hỏi trắc nghiệm về quản trị rủi ro tài chính cho cấp quản lý..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#c8a84e]" style={{ fontSize: "13px" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 mb-1 block" style={{ fontSize: "10px" }}>Số lượng</label>
                  <input type="number" defaultValue={10} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg" style={{ fontSize: "12px" }} />
                </div>
                <div>
                  <label className="text-gray-500 mb-1 block" style={{ fontSize: "10px" }}>Độ khó</label>
                  <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>
                    <option>Hỗn hợp</option>
                    {Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => <option key={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <p className="text-gray-400 mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>💡 GỢI Ý TỪ AI</p>
                <div className="space-y-1.5">
                  {AI_SUGGESTIONS.map((s, i) => (
                    <div key={i} onClick={() => { import("sonner").then(m => m.toast.info("Đã áp dụng gợi ý AI vào câu hỏi")); }} className="flex items-start gap-2 p-2 bg-[#c8a84e]/5 rounded-lg border border-[#c8a84e]/10 cursor-pointer hover:bg-[#c8a84e]/10 transition-colors">
                      <Brain className="w-3.5 h-3.5 text-[#c8a84e] mt-0.5 shrink-0" />
                      <p className="text-gray-600" style={{ fontSize: "11px", lineHeight: 1.4 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowAIGen(false)} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
              <button onClick={() => {
                // Mock: add 3 AI-generated questions
                const newQs: ExamQuestion[] = AI_SUGGESTIONS.slice(0, 3).map((s, i) => ({
                  id: `AI-${Date.now()}-${i}`, type: "single_choice" as QuestionType, question: s,
                  difficulty: (["medium", "hard", "medium"] as DifficultyLevel[])[i], points: 2, category: "AI Generated",
                  tags: ["ai-generated"], timeEstimate: 60,
                  options: ["Đáp án A (AI)", "Đáp án B (AI)", "Đáp án C (AI)", "Đáp án D (AI)"],
                  correctAnswers: [1], explanation: "Đây là câu hỏi được AI tạo tự động. Vui lòng review và chỉnh sửa đáp án.",
                }));
                setQuestions(prev => [...newQs, ...prev]);
                setShowAIGen(false);
              }} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#c8a84e] to-[#8a7235] text-white rounded-xl cursor-pointer" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Sparkles className="w-4 h-4" /> Tạo câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}