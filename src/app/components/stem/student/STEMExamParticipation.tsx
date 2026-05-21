import { useState } from "react";
import {
  ClipboardCheck, Clock, Calendar, Award, ChevronRight,
  PlayCircle, CheckCircle2, AlertCircle, Trophy,
} from "lucide-react";
import { stemExams } from "../../mock-data/index";
import type { STEMExam } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatDateTime, formatRelative } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  STEM EXAM PARTICIPATION (Student)                               */
/* ================================================================ */

const STATUS_META: Record<STEMExam["status"], { label: string; color: string }> = {
  upcoming: { label: "Sắp diễn ra", color: "#2563eb" },
  open:     { label: "Đang mở",     color: "#16a34a" },
  closed:   { label: "Đã đóng",     color: "#64748b" },
  graded:   { label: "Đã chấm",     color: "#c8a84e" },
};

const LEVEL_LABEL: Record<STEMExam["level"], string> = {
  school:   "Cấp trường",
  district: "Cấp quận/huyện",
  province: "Cấp tỉnh/TP",
  national: "Cấp Quốc gia",
};

export function STEMExamParticipation() {
  const [statusFilter, setStatusFilter] = useState<STEMExam["status"] | "all">("all");
  const filtered = stemExams.filter((e) => statusFilter === "all" || e.status === statusFilter);

  // Mock: HS đã đăng ký 3 kỳ thi đầu tiên
  const registeredIds = new Set(stemExams.slice(0, 3).map((e) => e.id));
  const myScores: Record<string, number> = {
    "EX-001": 8.5, "EX-003": 7.2,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ClipboardCheck}
        title="Kỳ thi STEM"
        subtitle="Truy cập và tham gia hệ sinh thái các kỳ thi STEM trực tuyến để đánh giá năng lực."
        accentColor="#16a34a"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={ClipboardCheck} label="Kỳ thi khả dụng" value={stemExams.length} color="#16a34a" />
        <KpiCard icon={CheckCircle2} label="Đã đăng ký" value={registeredIds.size} color="#2563eb" />
        <KpiCard icon={Trophy} label="Điểm cao nhất" value="8.5" color="#c8a84e" />
        <KpiCard icon={AlertCircle} label="Sắp diễn ra" value={stemExams.filter((e) => e.status === "upcoming").length} color="#f59e0b" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-lg border ${statusFilter === "all" ? "bg-[#16a34a] text-white border-[#16a34a]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả ({stemExams.length})
        </button>
        {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((k) => {
          const meta = STATUS_META[k];
          const count = stemExams.filter((e) => e.status === k).length;
          return (
            <button key={k} onClick={() => setStatusFilter(k)}
              className={`px-3 py-2 rounded-lg border ${statusFilter === k ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(statusFilter === k ? { backgroundColor: meta.color } : {}),
              }}>
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((e) => {
          const statusMeta = STATUS_META[e.status];
          const registered = registeredIds.has(e.id);
          const score = myScores[e.id];
          return (
            <div key={e.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
                  {e.name}
                </h3>
                <span className="px-2 py-0.5 rounded shrink-0" style={{
                  fontSize: "10.5px", fontWeight: 600,
                  color: statusMeta.color, backgroundColor: statusMeta.color + "15",
                }}>
                  {statusMeta.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {e.programCodes.map((c) => <ProgramBadge key={c} code={c} size="xs" />)}
                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                  · {LEVEL_LABEL[e.level]} · {e.gradeLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Bắt đầu</p>
                  <p style={{ fontSize: "12px", fontWeight: 500 }}>{formatDateTime(e.openAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Thời lượng</p>
                  <p style={{ fontSize: "12px", fontWeight: 500 }}>
                    <Clock className="w-3 h-3 inline mr-0.5" />
                    {e.durationMinutes >= 1440 ? `${Math.floor(e.durationMinutes / 1440)} ngày` : `${e.durationMinutes} phút`}
                    {" · "}{e.questionCount} câu
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-muted-foreground" style={{ fontSize: "11px" }}>
                  <Calendar className="w-3 h-3 inline mr-0.5" /> {e.organiser}
                </div>
                {score !== undefined && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#c8a84e]/15 text-[#c8a84e] rounded" style={{ fontSize: "12px", fontWeight: 700 }}>
                    <Trophy className="w-3 h-3" /> Điểm: {score}
                  </span>
                )}
              </div>

              <div className="mt-3">
                {e.status === "open" && (
                  <button onClick={() => toast.success(`Vào làm bài ${e.name}`)}
                    className="w-full px-3 py-2 bg-[#16a34a] text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-1.5"
                    style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    <PlayCircle className="w-4 h-4" /> Làm bài ngay
                  </button>
                )}
                {e.status === "upcoming" && (
                  <button onClick={() => toast.success(registered ? "Bỏ đăng ký" : `Đã đăng ký ${e.name}`)}
                    className={`w-full px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 border ${
                      registered ? "bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/30" : "bg-[#2563eb] text-white border-[#2563eb]"
                    }`}
                    style={{ fontSize: "12.5px", fontWeight: 500 }}>
                    {registered ? <><CheckCircle2 className="w-4 h-4" /> Đã đăng ký</>
                      : <><Calendar className="w-4 h-4" /> Đăng ký</>}
                  </button>
                )}
                {(e.status === "closed" || e.status === "graded") && (
                  <button onClick={() => toast.info(`Xem kết quả ${e.name}`)}
                    className="w-full px-3 py-2 border border-border rounded-lg hover:bg-secondary flex items-center justify-center gap-1.5"
                    style={{ fontSize: "12.5px", fontWeight: 500 }}>
                    <ChevronRight className="w-4 h-4" /> Xem kết quả
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default STEMExamParticipation;
