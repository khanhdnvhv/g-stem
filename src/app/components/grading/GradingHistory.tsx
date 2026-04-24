import { useState, useMemo } from "react";
import { CheckCircle, Edit3, RotateCcw, Trash2, MessageSquare, Download, Search, Filter, Calendar, User, Clock, ChevronDown, Shield, Brain, History, ArrowRight } from "lucide-react";
import { MOCK_GRADING_HISTORY, type GradeHistoryEntry, type GradeAction } from "./mock-data";
import { exportToCSV } from "../ExportManager";
import { EmptyState } from "../EmptyState";

interface GradingHistoryProps {
  isAdmin: boolean;
}

const ACTION_CONFIG: Record<GradeAction, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  graded: { label: "Chấm điểm", icon: CheckCircle, color: "#22c55e", bg: "#dcfce7" },
  revised: { label: "Sửa điểm", icon: Edit3, color: "#3b82f6", bg: "#dbeafe" },
  resubmit_request: { label: "Yêu cầu nộp lại", icon: RotateCcw, color: "#f97316", bg: "#ffedd5" },
  appeal_filed: { label: "Khiếu nại", icon: MessageSquare, color: "#8b5cf6", bg: "#ede9fe" },
  appeal_resolved: { label: "Giải quyết KN", icon: Shield, color: "#06b6d4", bg: "#cffafe" },
  override: { label: "Admin Override", icon: Shield, color: "#dc2626", bg: "#fee2e2" },
  auto_graded: { label: "AI Chấm tự động", icon: Brain, color: "#8b5cf6", bg: "#ede9fe" },
};

export function GradingHistory({ isAdmin }: GradingHistoryProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    let list = [...MOCK_GRADING_HISTORY];

    if (actionFilter !== "all") list = list.filter(e => e.action === actionFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.studentName.toLowerCase().includes(q) ||
        e.courseName.toLowerCase().includes(q) ||
        e.assignmentTitle.toLowerCase().includes(q) ||
        e.performedBy.toLowerCase().includes(q)
      );
    }
    if (dateFrom) list = list.filter(e => e.timestamp >= dateFrom);
    if (dateTo) list = list.filter(e => e.timestamp <= dateTo + " 23:59");

    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [search, actionFilter, dateFrom, dateTo]);

  // Stats
  const thisMonth = MOCK_GRADING_HISTORY.filter(e => e.timestamp.startsWith("2026-03"));
  const gradedThisMonth = thisMonth.filter(e => e.action === "graded").length;
  const revisedCount = MOCK_GRADING_HISTORY.filter(e => e.action === "revised").length;
  const overrideCount = MOCK_GRADING_HISTORY.filter(e => e.action === "override").length;

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, GradeHistoryEntry[]> = {};
    filtered.forEach(e => {
      const date = e.timestamp.split(" ")[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Chấm tháng này", value: gradedThisMonth, icon: CheckCircle, color: "#22c55e" },
          { label: "Sửa điểm", value: revisedCount, icon: Edit3, color: "#3b82f6" },
          { label: "Admin Override", value: overrideCount, icon: Shield, color: "#dc2626" },
          { label: "Tổng lịch sử", value: MOCK_GRADING_HISTORY.length, icon: History, color: "#6b7280" },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
              <Icon className="w-5 h-5 shrink-0" style={{ color: kpi.color }} />
              <div>
                <p className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{kpi.value}</p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col lg:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm học viên, khóa học, giảng viên..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
            style={{ fontSize: "13px" }}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "all", label: "Tất cả" },
            { key: "graded", label: "Chấm mới" },
            { key: "revised", label: "Sửa điểm" },
            { key: "override", label: "Override" },
            { key: "auto_graded", label: "AI Chấm" },
            { key: "appeal_filed", label: "Khiếu nại" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setActionFilter(f.key)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                actionFilter === f.key
                  ? "bg-[#990803] text-white"
                  : "bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            style={{ fontSize: "12px" }}
          />
          <span className="text-gray-400" style={{ fontSize: "11px" }}>đến</span>
          <input
            type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            style={{ fontSize: "12px" }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {grouped.map(([date, entries]) => (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500" style={{ fontSize: "12px", fontWeight: 600 }}>{date}</span>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400" style={{ fontSize: "11px" }}>{entries.length} hoạt động</span>
            </div>

            {/* Entries */}
            <div className="ml-1.5 border-l-2 border-gray-200 space-y-1">
              {entries.map(entry => {
                const ac = ACTION_CONFIG[entry.action];
                const Icon = ac.icon;

                return (
                  <div key={entry.id} className="relative pl-6 py-1.5">
                    {/* Timeline dot */}
                    <div
                      className="absolute left-[-5px] top-4 w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: ac.color }}
                    />

                    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: ac.bg }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: ac.color }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="px-1.5 py-0.5 rounded"
                              style={{ fontSize: "10px", fontWeight: 600, color: ac.color, backgroundColor: ac.bg }}
                            >
                              {ac.label}
                            </span>
                            <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>
                              {entry.performedBy}
                            </span>
                            <span className="text-gray-400" style={{ fontSize: "11px" }}>
                              chấm bài của <span className="text-gray-600" style={{ fontWeight: 500 }}>{entry.studentName}</span>
                            </span>
                          </div>

                          <p className="text-gray-500 mt-0.5" style={{ fontSize: "11.5px" }}>
                            {entry.assignmentTitle} — {entry.courseName.length > 30 ? entry.courseName.slice(0, 28) + "..." : entry.courseName}
                          </p>

                          {/* Score change */}
                          {(entry.newScore !== null || entry.oldScore !== null) && (
                            <div className="flex items-center gap-2 mt-1">
                              {entry.oldScore !== null && (
                                <span className="text-gray-400 line-through" style={{ fontSize: "12px" }}>{entry.oldScore}</span>
                              )}
                              {entry.oldScore !== null && entry.newScore !== null && (
                                <ArrowRight className="w-3 h-3 text-gray-400" />
                              )}
                              {entry.newScore !== null && (
                                <span
                                  className="px-1.5 py-0.5 rounded"
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: entry.newScore >= 60 ? "#16a34a" : "#dc2626",
                                    backgroundColor: entry.newScore >= 60 ? "#f0fdf4" : "#fef2f2",
                                  }}
                                >
                                  {entry.newScore}/{entry.maxScore}
                                </span>
                              )}
                              {entry.oldScore !== null && entry.newScore !== null && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: entry.newScore > entry.oldScore ? "#16a34a" : "#dc2626",
                                  }}
                                >
                                  ({entry.newScore > entry.oldScore ? "+" : ""}{entry.newScore - entry.oldScore})
                                </span>
                              )}
                            </div>
                          )}

                          {entry.reason && (
                            <p className="text-gray-400 mt-0.5" style={{ fontSize: "10.5px" }}>
                              Lý do: {entry.reason}
                            </p>
                          )}
                        </div>

                        <span className="text-gray-400 shrink-0" style={{ fontSize: "10.5px" }}>
                          {entry.timestamp.split(" ")[1]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            variant={search ? "search" : "empty"}
            title="Không có lịch sử chấm điểm"
            message={search ? `Không có kết quả cho "${search}"` : "Chưa có hoạt động chấm điểm nào"}
            action={search ? { label: "Xóa bộ lọc", onClick: () => { setSearch(""); setActionFilter("all"); setDateFrom(""); setDateTo(""); } } : undefined}
          />
        )}
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button
          onClick={() => exportToCSV(filtered as unknown as Record<string, unknown>[], "grading-history")}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          <Download className="w-4 h-4" /> Xuất CSV
        </button>
      </div>
    </div>
  );
}