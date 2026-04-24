import { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, Target, Clock, Users, Trophy, XCircle,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Brain, Zap,
  ArrowLeft, Download, Calendar, Hash, Award, Eye, Star,
  PieChart, Filter, ArrowUpDown, Sparkles, Lightbulb,
} from "lucide-react";
import type { Exam, ExamQuestion } from "./types";
import {
  MOCK_EXAMS,
  MOCK_ATTEMPTS,
  QUESTION_BANK,
  getExamQuestions,
  DIFFICULTY_CONFIG,
  QUESTION_TYPE_CONFIG,
  EXAM_TYPE_CONFIG,
} from "./types";
import { toast } from "sonner";

// ── Custom SVG Charts ──
function ScoreDistributionChart({ data }: { data: { range: string; count: number; color: string }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = 100 / data.length;
  return (
    <svg viewBox="0 0 400 200" className="w-full h-48">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
        <g key={ratio}>
          <line x1="40" y1={180 - ratio * 160} x2="395" y2={180 - ratio * 160} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x="35" y={184 - ratio * 160} textAnchor="end" fill="#9ca3af" fontSize="9">{Math.round(maxCount * ratio)}</text>
        </g>
      ))}
      {/* Bars */}
      {data.map((d, i) => {
        const x = 45 + i * (350 / data.length);
        const w = (350 / data.length) * 0.65;
        const h = (d.count / maxCount) * 160;
        return (
          <g key={d.range}>
            <rect x={x} y={180 - h} width={w} height={h} rx="4" fill={d.color} opacity="0.85" />
            <text x={x + w / 2} y={194} textAnchor="middle" fill="#6b7280" fontSize="8">{d.range}</text>
            <text x={x + w / 2} y={175 - h} textAnchor="middle" fill={d.color} fontSize="9" fontWeight="700">{d.count}</text>
          </g>
        );
      })}
    </svg>
  );
}

function AccuracyRadar({ data }: { data: { label: string; value: number }[] }) {
  const n = data.length;
  const cx = 150, cy = 130, r = 90;
  const points = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * r * (d.value / 100),
      y: cy + Math.sin(angle) * r * (d.value / 100),
      lx: cx + Math.cos(angle) * (r + 18),
      ly: cy + Math.sin(angle) * (r + 18),
      label: d.label,
      value: d.value,
    };
  });
  return (
    <svg viewBox="0 0 300 270" className="w-full h-60">
      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1].map(ratio => (
        <circle key={ratio} cx={cx} cy={cy} r={r * ratio} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
      ))}
      {/* Axes */}
      {data.map((_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke="#e5e7eb" strokeWidth="0.5" />;
      })}
      {/* Polygon */}
      <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="#99080320" stroke="#990803" strokeWidth="2" />
      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#990803" />
          <text x={p.lx} y={p.ly + 3} textAnchor="middle" fill="#374151" fontSize="8" fontWeight="500">{p.label}</text>
          <text x={p.lx} y={p.ly + 14} textAnchor="middle" fill="#990803" fontSize="9" fontWeight="700">{p.value}%</text>
        </g>
      ))}
    </svg>
  );
}

function TimelineChart({ data }: { data: { date: string; score: number; passed: boolean }[] }) {
  if (data.length === 0) return null;
  const w = 400, h = 150, pad = 40;
  const maxScore = 100;
  const xStep = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const points = data.map((d, i) => ({
    x: pad + i * xStep,
    y: pad + (1 - d.score / maxScore) * (h - pad * 2),
    ...d,
  }));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      {[0, 25, 50, 75, 100].map(v => {
        const y = pad + (1 - v / 100) * (h - pad * 2);
        return (
          <g key={v}>
            <line x1={pad} y1={y} x2={w - 10} y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
            <text x={pad - 5} y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="8">{v}%</text>
          </g>
        );
      })}
      {points.length > 1 && (
        <polyline points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#990803" strokeWidth="2" strokeLinejoin="round" />
      )}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={p.passed ? "#22c55e" : "#ef4444"} stroke="white" strokeWidth="2" />
          <text x={p.x} y={h - 5} textAnchor="middle" fill="#9ca3af" fontSize="7">{p.date}</text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({ data, size = 120 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 10;
  const cx = size / 2, cy = size / 2;
  let cumAngle = -Math.PI / 2;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxHeight: size }}>
      {data.map((d, i) => {
        const angle = (d.value / total) * Math.PI * 2;
        const x1 = cx + r * Math.cos(cumAngle);
        const y1 = cy + r * Math.sin(cumAngle);
        cumAngle += angle;
        const x2 = cx + r * Math.cos(cumAngle);
        const y2 = cy + r * Math.sin(cumAngle);
        const large = angle > Math.PI ? 1 : 0;
        return (
          <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={d.color} opacity="0.85" />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
      <text x={cx} y={cy - 2} textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="800">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" fontSize="7">lượt thi</text>
    </svg>
  );
}

export function ExamStatistics() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "all">("all");

  // Overview stats
  const overviewStats = useMemo(() => {
    const totalAttempts = MOCK_ATTEMPTS.length;
    const passedAttempts = MOCK_ATTEMPTS.filter(a => a.passed).length;
    const avgScore = totalAttempts > 0 ? Math.round(MOCK_ATTEMPTS.reduce((s, a) => s + a.percentage, 0) / totalAttempts) : 0;
    const avgTime = totalAttempts > 0 ? Math.round(MOCK_ATTEMPTS.reduce((s, a) => s + a.timeSpent, 0) / totalAttempts) : 0;
    const totalExams = MOCK_EXAMS.length;
    const uniqueExams = new Set(MOCK_ATTEMPTS.map(a => a.examId)).size;

    return { totalAttempts, passedAttempts, failRate: totalAttempts > 0 ? Math.round(((totalAttempts - passedAttempts) / totalAttempts) * 100) : 0, avgScore, avgTime, totalExams, uniqueExams };
  }, []);

  // Score distribution
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { range: "0-20", min: 0, max: 20, count: 0, color: "#ef4444" },
      { range: "21-40", min: 21, max: 40, count: 0, color: "#f97316" },
      { range: "41-60", min: 41, max: 60, count: 0, color: "#f59e0b" },
      { range: "61-80", min: 61, max: 80, count: 0, color: "#3b82f6" },
      { range: "81-100", min: 81, max: 100, count: 0, color: "#22c55e" },
    ];
    MOCK_ATTEMPTS.forEach(a => {
      const r = ranges.find(r => a.percentage >= r.min && a.percentage <= r.max);
      if (r) r.count++;
    });
    // Add mock data for visualization
    if (ranges.every(r => r.count === 0)) {
      ranges[0].count = 5; ranges[1].count = 12; ranges[2].count = 28; ranges[3].count = 45; ranges[4].count = 18;
    } else {
      // Scale up mock
      ranges[0].count += 3; ranges[1].count += 8; ranges[2].count += 15; ranges[3].count += 25; ranges[4].count += 12;
    }
    return ranges;
  }, []);

  // Per-exam stats
  const examStats = useMemo(() => {
    return MOCK_EXAMS.map(exam => {
      const attempts = MOCK_ATTEMPTS.filter(a => a.examId === exam.id);
      const totalAttempts = attempts.length + (exam.totalAttempts || 0);
      const avgScore = exam.avgScore || (attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0);
      const passRate = exam.passRate || (attempts.length > 0 ? Math.round(attempts.filter(a => a.passed).length / attempts.length * 100) : 0);
      return { exam, totalAttempts, avgScore, passRate };
    });
  }, []);

  // Question difficulty analysis (mock)
  const questionAnalysis = useMemo(() => {
    return QUESTION_BANK.slice(0, 15).map(q => ({
      id: q.id,
      question: q.question.substring(0, 60) + (q.question.length > 60 ? "..." : ""),
      type: q.type,
      difficulty: q.difficulty,
      accuracy: Math.round(20 + Math.random() * 70), // Mock accuracy
      avgTime: Math.round(q.timeEstimate * (0.7 + Math.random() * 0.8)),
      discriminationIndex: +(0.1 + Math.random() * 0.8).toFixed(2), // Mock DI
    }));
  }, []);

  // Category radar data
  const categoryRadar = useMemo(() => {
    const cats: Record<string, number[]> = {};
    QUESTION_BANK.forEach(q => {
      if (!cats[q.category]) cats[q.category] = [];
      cats[q.category].push(40 + Math.random() * 50); // Mock scores
    });
    return Object.entries(cats).slice(0, 6).map(([cat, scores]) => ({
      label: cat.length > 12 ? cat.substring(0, 12) + "…" : cat,
      value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
  }, []);

  // Timeline data (mock)
  const timelineData = useMemo(() => [
    { date: "01/03", score: 65, passed: false },
    { date: "05/03", score: 72, passed: true },
    { date: "08/03", score: 78, passed: true },
    { date: "10/03", score: 82, passed: true },
    { date: "15/03", score: 75, passed: true },
    { date: "20/03", score: 88, passed: true },
  ], []);

  // Pass/Fail donut
  const passFailData = useMemo(() => {
    const passed = MOCK_ATTEMPTS.filter(a => a.passed).length + 45; // augment mock
    const failed = MOCK_ATTEMPTS.filter(a => !a.passed).length + 18;
    return [
      { label: "Đạt", value: passed, color: "#22c55e" },
      { label: "Chưa đạt", value: failed, color: "#ef4444" },
    ];
  }, []);

  // Top performers (mock)
  const topPerformers = useMemo(() => [
    { name: "Nguyễn Thị Hồng", dept: "ABBank - Phòng Tín dụng", score: 95, avatar: "NH" },
    { name: "Trần Văn Đức", dept: "Xi măng Thăng Long - SX", score: 92, avatar: "TĐ" },
    { name: "Lê Hoàng Nam", dept: "KĐT Lê Trọng Tấn - KD", score: 90, avatar: "LN" },
    { name: "Phạm Minh Tuấn", dept: "Tập đoàn - CNTT", score: 88, avatar: "PT" },
    { name: "Vũ Thị Mai Anh", dept: "ABBank - Nhân sự", score: 87, avatar: "VA" },
  ], []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 600 }}>
            <BarChart3 className="w-5 h-5 text-[#990803]" /> Thống kê & Phân tích Thi
          </h2>
          <p className="text-gray-400" style={{ fontSize: "12px" }}>
            Tổng quan hiệu suất kiểm tra toàn Tập đoàn
          </p>
        </div>
        <div className="flex gap-2">
          <select value={timeRange} onChange={e => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" style={{ fontSize: "12px" }}>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="all">Tất cả</option>
          </select>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 cursor-pointer" style={{ fontSize: "12px" }}
            onClick={() => toast.success("Đang xuất báo cáo thống kê thi...")}>
            <Download className="w-3.5 h-3.5" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tổng lượt thi", value: overviewStats.totalAttempts + 63, icon: Users, color: "#990803", trend: "+12%" },
          { label: "Điểm TB", value: `${overviewStats.avgScore || 74}%`, icon: Target, color: "#c8a84e", trend: "+3%" },
          { label: "Tỷ lệ đạt", value: `${100 - overviewStats.failRate}%`, icon: Trophy, color: "#22c55e", trend: "+5%" },
          { label: "TB Thời gian", value: `${Math.round((overviewStats.avgTime || 2000) / 60)}p`, icon: Clock, color: "#3b82f6", trend: "-2p" },
          { label: "Đề thi active", value: overviewStats.totalExams, icon: BarChart3, color: "#8b5cf6", trend: "+2" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: `${stat.color}10` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600" style={{ fontSize: "9px", fontWeight: 600 }}>
                <TrendingUp className="w-2.5 h-2.5 inline" /> {stat.trend}
              </span>
            </div>
            <p className="text-gray-800" style={{ fontSize: "22px", fontWeight: 800 }}>{stat.value}</p>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <h3 className="text-gray-800 mb-3 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            <BarChart3 className="w-4 h-4 text-[#990803]" /> Phân bố điểm số
          </h3>
          <ScoreDistributionChart data={scoreDistribution} />
        </div>

        {/* Pass/Fail donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 mb-3 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            <PieChart className="w-4 h-4 text-[#990803]" /> Đạt / Chưa đạt
          </h3>
          <DonutChart data={passFailData} />
          <div className="flex justify-center gap-4 mt-3">
            {passFailData.map(d => (
              <div key={d.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <span className="text-gray-500" style={{ fontSize: "11px" }}>{d.label}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category radar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 mb-3 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Brain className="w-4 h-4 text-[#990803]" /> Năng lực theo Danh mục
          </h3>
          <AccuracyRadar data={categoryRadar} />
        </div>

        {/* Score trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 mb-3 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            <TrendingUp className="w-4 h-4 text-[#990803]" /> Xu hướng điểm trung bình
          </h3>
          <TimelineChart data={timelineData} />
          <div className="flex items-center gap-3 mt-2 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-400" style={{ fontSize: "10px" }}>Đạt</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-gray-400" style={{ fontSize: "10px" }}>Chưa đạt</span></div>
          </div>
        </div>
      </div>

      {/* Per-exam table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Zap className="w-4 h-4 text-[#c8a84e]" /> Hiệu suất theo Đề thi
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["Đề thi", "Loại", "Lượt thi", "Điểm TB", "Tỷ lệ đạt", "Độ khó", "Trạng thái"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-500" style={{ fontSize: "11px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examStats.map(({ exam, totalAttempts, avgScore, passRate }) => (
                <tr key={exam.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-gray-800 truncate max-w-[200px]" style={{ fontSize: "12px", fontWeight: 500 }}>{exam.title}</p>
                    <p className="text-gray-400 truncate max-w-[200px]" style={{ fontSize: "10px" }}>{exam.courseName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full" style={{
                      fontSize: "10px", fontWeight: 600,
                      color: EXAM_TYPE_CONFIG[exam.type].color,
                      background: EXAM_TYPE_CONFIG[exam.type].bg,
                    }}>
                      {EXAM_TYPE_CONFIG[exam.type].icon} {EXAM_TYPE_CONFIG[exam.type].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: "13px", fontWeight: 600 }}>{totalAttempts.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${avgScore}%`,
                          background: avgScore >= 70 ? "#22c55e" : avgScore >= 50 ? "#f59e0b" : "#ef4444",
                        }} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: avgScore >= 70 ? "#22c55e" : avgScore >= 50 ? "#f59e0b" : "#ef4444" }}>{avgScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: "12px", fontWeight: 600, color: passRate >= 70 ? "#22c55e" : passRate >= 50 ? "#f59e0b" : "#ef4444" }}>{passRate}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full" style={{
                      fontSize: "10px", fontWeight: 600,
                      color: DIFFICULTY_CONFIG[exam.difficulty].color,
                      background: DIFFICULTY_CONFIG[exam.difficulty].bg,
                    }}>
                      {"★".repeat(DIFFICULTY_CONFIG[exam.difficulty].stars)} {DIFFICULTY_CONFIG[exam.difficulty].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${totalAttempts > 0 ? "bg-green-400" : "bg-gray-300"}`} />
                    <span className="text-gray-500" style={{ fontSize: "11px" }}>{totalAttempts > 0 ? "Active" : "Chờ"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question analysis + Top performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Question analysis */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Lightbulb className="w-4 h-4 text-[#c8a84e]" /> Phân tích Câu hỏi
            </h3>
            <span className="text-gray-400" style={{ fontSize: "10px" }}>Discrimination Index (DI): &gt;0.4 = Tốt, 0.2-0.4 = TB, &lt;0.2 = Yếu</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  {["ID", "Câu hỏi", "Loại", "Độ chính xác", "TB Time", "DI"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questionAnalysis.map(q => (
                  <tr key={q.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-3 py-2.5 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>{q.id}</td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[250px] truncate" style={{ fontSize: "11px" }}>{q.question}</td>
                    <td className="px-3 py-2.5">
                      <span style={{ fontSize: "9px", color: QUESTION_TYPE_CONFIG[q.type]?.color }}>
                        {QUESTION_TYPE_CONFIG[q.type]?.icon} {QUESTION_TYPE_CONFIG[q.type]?.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${q.accuracy}%`,
                            background: q.accuracy >= 70 ? "#22c55e" : q.accuracy >= 40 ? "#f59e0b" : "#ef4444",
                          }} />
                        </div>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: q.accuracy >= 70 ? "#22c55e" : q.accuracy >= 40 ? "#f59e0b" : "#ef4444" }}>{q.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500" style={{ fontSize: "11px" }}>{q.avgTime}s</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded ${q.discriminationIndex >= 0.4 ? "bg-green-50 text-green-600" : q.discriminationIndex >= 0.2 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"}`}
                        style={{ fontSize: "10px", fontWeight: 600 }}>
                        {q.discriminationIndex}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top performers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Trophy className="w-4 h-4 text-[#c8a84e]" /> Top Học viên
          </h3>
          <div className="space-y-3">
            {topPerformers.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center">
                    <span className="text-white" style={{ fontSize: "11px", fontWeight: 700 }}>{p.avatar}</span>
                  </div>
                  {i < 3 && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                      i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-300" : "bg-amber-600"
                    }`}>
                      <span className="text-white" style={{ fontSize: "8px", fontWeight: 800 }}>{i + 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{p.name}</p>
                  <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>{p.dept}</p>
                </div>
                <span className="text-[#990803]" style={{ fontSize: "14px", fontWeight: 800 }}>{p.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-purple-800 mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>AI Insights & Đề xuất</h3>
            <div className="space-y-2">
              {[
                "📊 Câu EQ016 (DCF) có Discrimination Index thấp (0.18) — nên xem xét điều chỉnh độ khó hoặc viết lại distractors.",
                "⚡ Thời gian làm bài trung bình đang giảm 2 phút/tháng — học viên đang quen dần với format thi.",
                "🎯 Danh mục 'Quản trị Rủi ro' có accuracy thấp nhất (45%) — cần tăng cường nội dung đào tạo.",
                "🏆 Top 10% học viên hoàn thành bài nhanh hơn 35% so với trung bình mà vẫn đạt >90 điểm.",
              ].map((insight, i) => (
                <p key={i} className="text-purple-700" style={{ fontSize: "12px", lineHeight: 1.6 }}>{insight}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}