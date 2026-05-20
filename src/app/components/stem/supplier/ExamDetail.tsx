/* ================================================================ */
/*  EXAM DETAIL — Chi tiết kỳ thi + Chấm điểm + Bảng điểm            */
/*  Route: /supplier/exams/:id                                        */
/* ================================================================ */

import { useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import {
  ClipboardCheck, ArrowLeft, Users, Clock, Calendar, Award,
  CheckCircle2, PlayCircle, StopCircle, FileText, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  stemExams, EXAM_QUESTIONS, getExamResults,
  QUESTION_DIFFICULTY_META,
  type STEMExam, type ExamResult,
} from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatDateTime } from "../ui/format";
import { toast } from "@/app/lib/toast";

const STATUS_META: Record<STEMExam["status"], { label: string; color: string }> = {
  upcoming: { label: "Sắp diễn ra", color: "#0891b2" },
  open:     { label: "Đang mở",     color: "#16a34a" },
  closed:   { label: "Đã đóng",     color: "#64748b" },
  graded:   { label: "Đã chấm",     color: "#c8a84e" },
};

/* Sinh kết quả mock khi chấm điểm kỳ thi chưa có sẵn results */
function generateMockResults(exam: STEMExam): ExamResult[] {
  const n = exam.totalParticipants ?? 40;
  const names = [
    "Nguyễn Văn", "Trần Thị", "Lê Minh", "Phạm Thu", "Hoàng Văn",
    "Vũ Thị", "Đỗ Minh", "Bùi Thị", "Ngô Văn", "Dương Thị",
  ];
  const lastNames = ["An", "Bình", "Cường", "Dung", "Em", "Phương", "Quân", "Hoa", "Khôi", "Lan"];
  const count = Math.min(n, 20);
  return Array.from({ length: count }, (_, i) => {
    const score = +(4 + ((i * 37) % 60) / 10).toFixed(1);
    return {
      examId: exam.id,
      studentName: `${names[i % names.length]} ${lastNames[(i * 3) % lastNames.length]}`,
      studentClass: `${exam.gradeLevel.replace(/\D/g, "")}A${(i % 3) + 1}`,
      score,
      correctCount: Math.round((score / 10) * exam.questionCount),
      totalQuestions: exam.questionCount,
      submittedAt: exam.closeAt,
    };
  });
}

export function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const exam = stemExams.find((e) => e.id === id);

  const [status, setStatus] = useState<STEMExam["status"]>(exam?.status ?? "upcoming");
  const [results, setResults] = useState<ExamResult[]>(() =>
    exam ? getExamResults(exam.id) : [],
  );

  if (!exam) {
    return (
      <div className="p-10 text-center space-y-3">
        <p className="text-muted-foreground">Không tìm thấy kỳ thi <strong>{id}</strong>.</p>
        <Link to="/supplier/exams" className="text-[#990803] underline" style={{ fontSize: "13px" }}>
          ← Quay lại Hệ sinh thái Kỳ thi
        </Link>
      </div>
    );
  }

  /* Câu hỏi của kỳ thi */
  const examQuestions = useMemo(() => {
    if (exam.questionIds && exam.questionIds.length > 0) {
      return EXAM_QUESTIONS.filter((q) => exam.questionIds!.includes(q.id));
    }
    /* Kỳ thi cũ không có questionIds → lấy mẫu theo CT */
    return EXAM_QUESTIONS.filter((q) => exam.programCodes.includes(q.programCode)).slice(0, exam.questionCount);
  }, [exam]);

  const sm = STATUS_META[status];
  const passingScore = exam.passingScore ?? 5;

  /* Thống kê điểm */
  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const scores = results.map((r) => r.score);
    const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const passed = results.filter((r) => r.score >= passingScore).length;
    return { avg: +avg.toFixed(2), max, min, passed, passRate: Math.round((passed / results.length) * 100) };
  }, [results, passingScore]);

  /* Phân bố điểm */
  const distribution = useMemo(() => {
    const buckets = [
      { range: "0-2", min: 0, max: 2, count: 0, fill: "#dc2626" },
      { range: "2-4", min: 2, max: 4, count: 0, fill: "#ea580c" },
      { range: "4-6", min: 4, max: 6, count: 0, fill: "#c8a84e" },
      { range: "6-8", min: 6, max: 8, count: 0, fill: "#0891b2" },
      { range: "8-10", min: 8, max: 10.01, count: 0, fill: "#16a34a" },
    ];
    results.forEach((r) => {
      const b = buckets.find((x) => r.score >= x.min && r.score < x.max);
      if (b) b.count++;
    });
    return buckets;
  }, [results]);

  /* Handlers vòng đời */
  const handleOpen = () => { setStatus("open"); toast.success("Đã mở kỳ thi — học sinh có thể làm bài"); };
  const handleClose = () => { setStatus("closed"); toast.info("Đã đóng kỳ thi"); };
  const handleGrade = () => {
    const generated = results.length > 0 ? results : generateMockResults(exam);
    setResults(generated);
    setStatus("graded");
    toast.success(`Đã chấm điểm ${generated.length} bài thi`);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2" style={{ fontSize: "12px" }}>
        <Link to="/supplier/exams" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Hệ sinh thái Kỳ thi
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground truncate" style={{ maxWidth: "300px" }}>{exam.name}</span>
      </div>

      <PageHeader
        icon={ClipboardCheck}
        title={exam.name}
        subtitle={`${exam.gradeLevel} · ${exam.durationMinutes} phút · ${examQuestions.length} câu hỏi`}
        accentColor="#990803"
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
            style={{ fontSize: "11px", fontWeight: 600, color: sm.color, backgroundColor: sm.color + "15" }}>
            {sm.label}
          </span>
        }
        actions={
          <>
            {status === "upcoming" && (
              <button onClick={handleOpen}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d]"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <PlayCircle className="w-4 h-4" /> Mở thi
              </button>
            )}
            {status === "open" && (
              <button onClick={handleClose}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#64748b] text-white rounded-lg hover:opacity-90"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <StopCircle className="w-4 h-4" /> Đóng thi
              </button>
            )}
            {status === "closed" && (
              <button onClick={handleGrade}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#c8a84e] text-white rounded-lg hover:opacity-90"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <Award className="w-4 h-4" /> Chấm điểm
              </button>
            )}
          </>
        }
      />

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "11px" }}>
            <Calendar className="w-3 h-3" /> Bắt đầu
          </p>
          <p style={{ fontSize: "13px", fontWeight: 600 }}>{formatDateTime(exam.openAt)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "11px" }}>
            <Clock className="w-3 h-3" /> Thời lượng
          </p>
          <p style={{ fontSize: "13px", fontWeight: 600 }}>{exam.durationMinutes} phút</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "11px" }}>
            <Users className="w-3 h-3" /> Thí sinh
          </p>
          <p style={{ fontSize: "13px", fontWeight: 600 }}>{exam.totalParticipants ?? results.length ?? "—"}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "11px" }}>
            <Award className="w-3 h-3" /> Điểm đạt
          </p>
          <p style={{ fontSize: "13px", fontWeight: 600 }}>{passingScore}/10</p>
        </div>
      </div>

      {/* Đơn vị + CT */}
      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 flex-wrap">
        <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Đơn vị tổ chức:</span>
        <strong style={{ fontSize: "13px" }}>{exam.organiser}</strong>
        <span className="text-muted-foreground" style={{ fontSize: "12px" }}>·</span>
        {exam.programCodes.map((c) => <ProgramBadge key={c} code={c} size="xs" />)}
      </div>

      {/* === Bảng điểm (khi graded) === */}
      {status === "graded" && stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={TrendingUp} label="Điểm trung bình" value={stats.avg} color="#990803" />
            <KpiCard icon={Award} label="Điểm cao nhất" value={stats.max} color="#16a34a" />
            <KpiCard icon={CheckCircle2} label="Tỷ lệ đạt" value={`${stats.passRate}%`} color="#c8a84e" subtitle={`${stats.passed}/${results.length} HS`} />
            <KpiCard icon={Users} label="Đã nộp bài" value={results.length} color="#0891b2" />
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bố điểm số</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v: number) => `${v} học sinh`} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distribution.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Bảng điểm chi tiết ({results.length} thí sinh)</h3>
            </div>
            <table className="w-full">
              <thead className="bg-secondary/50 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                <tr>
                  <th className="px-4 py-2.5 text-left">Học sinh</th>
                  <th className="px-4 py-2.5 text-left">Lớp</th>
                  <th className="px-4 py-2.5 text-right">Số câu đúng</th>
                  <th className="px-4 py-2.5 text-right">Điểm</th>
                  <th className="px-4 py-2.5 text-center">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
                {[...results].sort((a, b) => b.score - a.score).map((r, i) => {
                  const passed = r.score >= passingScore;
                  return (
                    <tr key={i} className="hover:bg-secondary/30">
                      <td className="px-4 py-2.5" style={{ fontWeight: 500 }}>{r.studentName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.studentClass}</td>
                      <td className="px-4 py-2.5 text-right">{r.correctCount}/{r.totalQuestions}</td>
                      <td className="px-4 py-2.5 text-right" style={{ fontWeight: 700, color: passed ? "#16a34a" : "#dc2626" }}>
                        {r.score.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full" style={{
                          fontSize: "11px", fontWeight: 600,
                          color: passed ? "#16a34a" : "#dc2626",
                          backgroundColor: passed ? "#16a34a15" : "#dc262615",
                        }}>
                          {passed ? "Đạt" : "Chưa đạt"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* === Danh sách câu hỏi === */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#990803]" />
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Đề thi ({examQuestions.length} câu)</h3>
          <Link to="/supplier/exams/questions" className="ml-auto text-[#990803] hover:underline" style={{ fontSize: "11.5px", fontWeight: 500 }}>
            Ngân hàng câu hỏi →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {examQuestions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground" style={{ fontSize: "12.5px" }}>
              Kỳ thi chưa gắn câu hỏi
            </p>
          ) : examQuestions.map((q, i) => {
            const dm = QUESTION_DIFFICULTY_META[q.difficulty];
            return (
              <div key={q.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-secondary/30">
                <span className="w-6 h-6 rounded-full bg-secondary text-muted-foreground flex items-center justify-center shrink-0"
                  style={{ fontSize: "11px", fontWeight: 700 }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "12.5px", lineHeight: 1.45 }}>{q.content}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ProgramBadge code={q.programCode} size="xs" />
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9.5px", fontWeight: 600, color: dm.color, backgroundColor: dm.color + "15" }}>
                      {dm.label}
                    </span>
                    <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{q.points} điểm</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ExamDetail;
