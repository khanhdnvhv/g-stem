import { useState, useMemo } from "react";
import {
  Search, Clock, CheckCircle, AlertTriangle, XCircle,
  FileText, Brain, Zap,
  CheckSquare, Square, Eye,
} from "lucide-react";
import {
  MOCK_SUBMISSIONS, STATUS_CONFIG, PRIORITY_CONFIG, GRADING_COURSES,
  type GradingSubmission, type SubmissionStatus,
} from "./mock-data";

interface GradingQueueProps {
  onOpenGrading: (submissionId: string) => void;
  isAdmin: boolean;
}

const typeLabels: Record<string, string> = {
  essay: "Tự luận",
  file_upload: "File",
  quiz: "Trắc nghiệm",
  project: "Dự án",
  presentation: "Thuyết trình",
};

export function GradingQueue({ onOpenGrading, isAdmin }: GradingQueueProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "date" | "name">("priority");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBatchBar, setShowBatchBar] = useState(false);

  const filtered = useMemo(() => {
    let list = [...MOCK_SUBMISSIONS];

    if (statusFilter !== "all") list = list.filter(s => s.status === statusFilter);
    if (courseFilter !== "all") list = list.filter(s => s.courseId === courseFilter);
    if (typeFilter !== "all") list = list.filter(s => s.assignmentType === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.studentName.toLowerCase().includes(q) ||
        s.assignmentTitle.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }

    // Sort
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (sortBy === "priority") {
      list.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === "date") {
      list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    } else {
      list.sort((a, b) => a.studentName.localeCompare(b.studentName));
    }

    return list;
  }, [search, statusFilter, courseFilter, typeFilter, sortBy]);

  // Stats
  const pendingCount = MOCK_SUBMISSIONS.filter(s => s.status === "pending").length;
  const overdueCount = MOCK_SUBMISSIONS.filter(s => s.isOverdue).length;
  const gradedTodayCount = MOCK_SUBMISSIONS.filter(s => s.status === "graded").length;
  const lateCount = MOCK_SUBMISSIONS.filter(s => s.status === "late").length;

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(s => s.id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Chờ chấm", value: pendingCount, icon: Clock, color: "#f59e0b", bg: "#fef3c7" },
          { label: "Quá hạn", value: overdueCount, icon: AlertTriangle, color: "#ef4444", bg: "#fee2e2" },
          { label: "Nộp muộn", value: lateCount, icon: XCircle, color: "#f97316", bg: "#ffedd5" },
          { label: "Đã chấm", value: gradedTodayCount, icon: CheckCircle, color: "#22c55e", bg: "#dcfce7" },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                <Icon className="w-4.5 h-4.5" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-gray-800" style={{ fontSize: "20px", fontWeight: 700 }}>{kpi.value}</p>
                <p className="text-gray-500" style={{ fontSize: "11px" }}>{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex flex-col lg:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm học viên, bài tập, mã bài..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803]/30"
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ chấm" },
              { key: "late", label: "Nộp muộn" },
              { key: "graded", label: "Đã chấm" },
              { key: "resubmit", label: "Nộp lại" },
              { key: "appeal", label: "Khiếu nại" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === f.key
                    ? "bg-[#990803] text-white"
                    : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
                style={{ fontSize: "11.5px", fontWeight: 500 }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Second row filters */}
        <div className="flex flex-wrap gap-2 mt-2.5">
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none"
            style={{ fontSize: "12px" }}
          >
            <option value="all">Tất cả khóa học</option>
            {GRADING_COURSES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none"
            style={{ fontSize: "12px" }}
          >
            <option value="all">Tất cả loại bài</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none"
            style={{ fontSize: "12px" }}
          >
            <option value="priority">Ưu tiên</option>
            <option value="date">Ngày nộp</option>
            <option value="name">Tên A-Z</option>
          </select>

          <span className="text-gray-400 flex items-center ml-auto" style={{ fontSize: "12px" }}>
            {filtered.length} bài nộp
          </span>
        </div>
      </div>

      {/* Batch selection bar */}
      {selected.size > 0 && (
        <div className="bg-[#990803]/5 border border-[#990803]/20 rounded-xl p-3 flex items-center gap-3">
          <span className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 600 }}>
            Đã chọn {selected.size} bài
          </span>
          <button
            onClick={() => { /* batch grade mock */ }}
            className="px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors cursor-pointer"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            Chấm nhanh hàng loạt
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            Bỏ chọn tất cả
          </button>
        </div>
      )}

      {/* Submission List */}
      <div className="space-y-2">
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-1.5">
          <button onClick={toggleSelectAll} className="cursor-pointer text-gray-400 hover:text-[#990803]">
            {selected.size === filtered.length && filtered.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-[#990803]" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
          <span className="text-gray-400" style={{ fontSize: "11px" }}>Chọn tất cả</span>
        </div>

        {filtered.map(sub => {
          const sc = STATUS_CONFIG[sub.status];
          const pc = PRIORITY_CONFIG[sub.priority];
          const isSelected = selected.has(sub.id);

          return (
            <div
              key={sub.id}
              className={`bg-white rounded-xl border p-3.5 hover:shadow-sm transition-all ${
                isSelected ? "border-[#990803]/30 bg-[#990803]/[0.02]" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(sub.id)}
                  className="mt-1 cursor-pointer text-gray-400 hover:text-[#990803] shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#990803]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                {/* Priority indicator */}
                <div
                  className="w-1 h-10 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: pc.color }}
                  title={pc.label}
                />

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ fontSize: "11px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
                >
                  {sub.studentAvatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-gray-800" style={{ fontSize: "13.5px", fontWeight: 600 }}>
                      {sub.studentName}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded-full"
                      style={{ fontSize: "10px", fontWeight: 600, color: sc.color, backgroundColor: sc.bg }}
                    >
                      {sc.label}
                    </span>
                    {sub.isOverdue && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-600" style={{ fontSize: "10px", fontWeight: 600 }}>
                        Quá hạn
                      </span>
                    )}
                    {sub.aiSuggested && (
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 flex items-center gap-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>
                        <Brain className="w-3 h-3" /> AI sẵn sàng
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 truncate" style={{ fontSize: "12.5px" }}>
                    {sub.assignmentTitle}
                  </p>

                  <div className="flex items-center gap-2 mt-1 flex-wrap text-gray-400" style={{ fontSize: "11px" }}>
                    <span>{sub.courseName.length > 30 ? sub.courseName.slice(0, 30) + "..." : sub.courseName}</span>
                    <span className="text-gray-300">|</span>
                    <span>{sub.subsidiary.replace("BDS Geleximco - ", "").replace("Tap doan ", "")}</span>
                    <span className="text-gray-300">|</span>
                    <span>{typeLabels[sub.assignmentType]}</span>
                    <span className="text-gray-300">|</span>
                    <span>Nộp: {sub.submittedAt}</span>
                    {sub.fileCount > 0 && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-0.5">
                          <FileText className="w-3 h-3" /> {sub.fileCount} file
                        </span>
                      </>
                    )}
                    {sub.wordCount && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span>{sub.wordCount} từ</span>
                      </>
                    )}
                    {isAdmin && sub.gradedBy && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="text-blue-500">GV: {sub.gradedBy}</span>
                      </>
                    )}
                  </div>

                  {/* Score if graded */}
                  {sub.score !== null && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="px-2 py-0.5 rounded-lg"
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: sub.score >= 80 ? "#16a34a" : sub.score >= 60 ? "#eab308" : "#dc2626",
                          backgroundColor: sub.score >= 80 ? "#f0fdf4" : sub.score >= 60 ? "#fefce8" : "#fef2f2",
                        }}
                      >
                        {sub.score}/{sub.maxScore} ({sub.letterGrade})
                      </span>
                      {sub.feedback && (
                        <span className="text-gray-400 truncate max-w-xs" style={{ fontSize: "11px" }}>
                          "{sub.feedback.slice(0, 60)}..."
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => onOpenGrading(sub.id)}
                    className="px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors cursor-pointer flex items-center gap-1"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    {sub.status === "graded" ? (
                      <><Eye className="w-3.5 h-3.5" /> Xem lại</>
                    ) : (
                      <><Zap className="w-3.5 h-3.5" /> Chấm điểm</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400" style={{ fontSize: "14px", fontWeight: 500 }}>Không có bài nộp nào</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "12px" }}>Thử thay đổi bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  );
}