import { useState, useMemo } from "react";
import {
  Download, ArrowUpDown,
  Search, Check, X,
} from "lucide-react";
import {
  MOCK_GRADEBOOK, GRADING_COURSES, GRADING_ASSIGNMENTS,
  getLetterGrade, getLetterColor, getGradebookAssignments,
  type GradebookEntry,
} from "./mock-data";
import { exportToCSV } from "../ExportManager";

interface GradebookProps {
  isAdmin: boolean;
}

function getScoreColor(score: number | null): string {
  if (score === null) return "#d1d5db";
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#eab308";
  return "#dc2626";
}
function getScoreBg(score: number | null): string {
  if (score === null) return "#f9fafb";
  if (score >= 80) return "#f0fdf4";
  if (score >= 60) return "#fefce8";
  return "#fef2f2";
}

export function Gradebook({ isAdmin }: GradebookProps) {
  const [courseId, setCourseId] = useState("C004");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingCell, setEditingCell] = useState<{ studentId: string; assignmentId: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [gradebook, setGradebook] = useState(MOCK_GRADEBOOK);

  const assignments = getGradebookAssignments();

  const filtered = useMemo(() => {
    let list = [...gradebook];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.studentName.toLowerCase().includes(q) || e.studentId.toLowerCase().includes(q));
    }

    // Sort
    list.sort((a, b) => {
      let av: number, bv: number;
      if (sortCol === "rank") {
        av = a.rank ?? 999; bv = b.rank ?? 999;
      } else if (sortCol === "name") {
        return sortDir === "asc" ? a.studentName.localeCompare(b.studentName) : b.studentName.localeCompare(a.studentName);
      } else if (sortCol === "avg") {
        av = a.average ?? -1; bv = b.average ?? -1;
      } else {
        av = a.scores[sortCol]?.score ?? -1;
        bv = b.scores[sortCol]?.score ?? -1;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });

    return list;
  }, [gradebook, search, sortCol, sortDir]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const handleSaveEdit = (studentId: string, assignmentId: string) => {
    const val = parseInt(editValue);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setGradebook(prev => prev.map(e => {
        if (e.studentId !== studentId) return e;
        const newScores = { ...e.scores };
        newScores[assignmentId] = { ...newScores[assignmentId], score: val, status: "graded", gradedAt: "2026-03-12" };
        const scored = Object.values(newScores).filter(s => s.score !== null);
        const avg = scored.length > 0 ? Math.round(scored.reduce((s, v) => s + (v.score || 0), 0) / scored.length * 10) / 10 : null;
        return { ...e, scores: newScores, average: avg };
      }));
    }
    setEditingCell(null);
    setEditValue("");
  };

  // Stats row
  const colStats = useMemo(() => {
    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    assignments.forEach(a => {
      const scores = gradebook.map(e => e.scores[a.id]?.score).filter((s): s is number => s !== null);
      stats[a.id] = {
        avg: scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length * 10) / 10 : 0,
        min: scores.length > 0 ? Math.min(...scores) : 0,
        max: scores.length > 0 ? Math.max(...scores) : 0,
        count: scores.length,
      };
    });
    return stats;
  }, [gradebook, assignments]);

  const classAvg = useMemo(() => {
    const avgs = gradebook.map(e => e.average).filter((a): a is number => a !== null);
    return avgs.length > 0 ? Math.round(avgs.reduce((s, v) => s + v, 0) / avgs.length * 10) / 10 : 0;
  }, [gradebook]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
          style={{ fontSize: "13px" }}
        >
          {GRADING_COURSES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm học viên..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
            style={{ fontSize: "13px" }}
          />
        </div>

        <button
          onClick={() => exportToCSV(gradebook as unknown as Record<string, unknown>[], "gradebook")}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5"
          style={{ fontSize: "12.5px", fontWeight: 500 }}
        >
          <Download className="w-4 h-4" /> Xuất Excel
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-gray-800" style={{ fontSize: "20px", fontWeight: 700 }}>{gradebook.length}</p>
          <p className="text-gray-400" style={{ fontSize: "11px" }}>Học viên</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p style={{ fontSize: "20px", fontWeight: 700, color: getScoreColor(classAvg) }}>{classAvg}</p>
          <p className="text-gray-400" style={{ fontSize: "11px" }}>TB Lớp</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-green-600" style={{ fontSize: "20px", fontWeight: 700 }}>
            {gradebook.filter(e => (e.average || 0) >= 60).length}
          </p>
          <p className="text-gray-400" style={{ fontSize: "11px" }}>Đạt</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-red-500" style={{ fontSize: "20px", fontWeight: 700 }}>
            {gradebook.filter(e => e.average !== null && e.average < 60).length}
          </p>
          <p className="text-gray-400" style={{ fontSize: "11px" }}>Chưa đạt</p>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky left-0 bg-gray-50 z-10 px-3 py-2.5 text-left" style={{ fontSize: "11px", fontWeight: 600, minWidth: "40px" }}>
                  <button onClick={() => handleSort("rank")} className="flex items-center gap-1 text-gray-500 hover:text-[#990803] cursor-pointer">
                    # <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="sticky left-10 bg-gray-50 z-10 px-3 py-2.5 text-left" style={{ fontSize: "11px", fontWeight: 600, minWidth: "160px" }}>
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1 text-gray-500 hover:text-[#990803] cursor-pointer">
                    Học viên <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                {assignments.map(a => (
                  <th key={a.id} className="px-2 py-2.5 text-center" style={{ fontSize: "10.5px", fontWeight: 600, minWidth: "90px" }}>
                    <button onClick={() => handleSort(a.id)} className="text-gray-500 hover:text-[#990803] cursor-pointer">
                      {a.title.length > 20 ? a.title.slice(0, 18) + "..." : a.title}
                      <br />
                      <span className="text-gray-400" style={{ fontWeight: 400 }}>/{a.maxScore}</span>
                    </button>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center" style={{ fontSize: "11px", fontWeight: 600, minWidth: "70px" }}>
                  <button onClick={() => handleSort("avg")} className="flex items-center gap-1 text-gray-500 hover:text-[#990803] cursor-pointer mx-auto">
                    TB <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-3 py-2.5 text-center" style={{ fontSize: "11px", fontWeight: 600, minWidth: "50px" }}>
                  Xếp loại
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.studentId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="sticky left-0 bg-white z-10 px-3 py-2 text-gray-400" style={{ fontSize: "11px" }}>
                    {entry.rank || "-"}
                  </td>
                  <td className="sticky left-10 bg-white z-10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{ fontSize: "10px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
                      >
                        {entry.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{entry.studentName}</p>
                        <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>
                          {entry.subsidiary.replace("BDS Geleximco - ", "").slice(0, 20)}
                        </p>
                      </div>
                    </div>
                  </td>
                  {assignments.map(a => {
                    const cell = entry.scores[a.id];
                    const isEditing = editingCell?.studentId === entry.studentId && editingCell?.assignmentId === a.id;
                    return (
                      <td key={a.id} className="px-2 py-2 text-center">
                        {isEditing ? (
                          <div className="flex items-center gap-1 justify-center">
                            <input
                              type="number" min={0} max={100} value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="w-12 px-1 py-0.5 border border-[#990803] rounded text-center focus:outline-none"
                              style={{ fontSize: "12px" }}
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === "Enter") handleSaveEdit(entry.studentId, a.id);
                                if (e.key === "Escape") { setEditingCell(null); setEditValue(""); }
                              }}
                            />
                            <button onClick={() => handleSaveEdit(entry.studentId, a.id)} className="text-green-600 cursor-pointer">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { setEditingCell(null); setEditValue(""); }} className="text-red-400 cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (!isAdmin || cell?.score !== null) {
                                setEditingCell({ studentId: entry.studentId, assignmentId: a.id });
                                setEditValue(String(cell?.score ?? ""));
                              }
                            }}
                            className="inline-block px-2 py-0.5 rounded cursor-pointer hover:ring-1 hover:ring-[#990803]/30 transition-all"
                            style={{
                              fontSize: "12px",
                              fontWeight: cell?.score !== null ? 600 : 400,
                              color: getScoreColor(cell?.score ?? null),
                              backgroundColor: getScoreBg(cell?.score ?? null),
                            }}
                          >
                            {cell?.score !== null ? cell.score : "—"}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded-lg"
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: getScoreColor(entry.average),
                        backgroundColor: getScoreBg(entry.average),
                      }}
                    >
                      {entry.average !== null ? entry.average : "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {entry.average !== null && (
                      <span
                        className="inline-block px-1.5 py-0.5 rounded"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: getLetterColor(getLetterGrade(entry.average)),
                          backgroundColor: getLetterColor(getLetterGrade(entry.average)) + "15",
                        }}
                      >
                        {getLetterGrade(entry.average)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Stats row */}
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="sticky left-0 bg-gray-50 z-10 px-3 py-2" />
                <td className="sticky left-10 bg-gray-50 z-10 px-3 py-2">
                  <span className="text-gray-500" style={{ fontSize: "11px", fontWeight: 600 }}>Thống kê lớp</span>
                </td>
                {assignments.map(a => {
                  const s = colStats[a.id];
                  return (
                    <td key={a.id} className="px-2 py-2 text-center">
                      <p style={{ fontSize: "11px", fontWeight: 600, color: getScoreColor(s?.avg || 0) }}>
                        TB: {s?.avg || 0}
                      </p>
                      <p className="text-gray-400" style={{ fontSize: "9.5px" }}>
                        {s?.min || 0}-{s?.max || 0} ({s?.count || 0})
                      </p>
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center">
                  <span style={{ fontSize: "12px", fontWeight: 700, color: getScoreColor(classAvg) }}>{classAvg}</span>
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}