import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  ClipboardCheck, Plus, Calendar, Users, Award, Download,
  School as SchoolIcon, Clock, CheckCircle2, Info, PlayCircle,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { stemExams } from "../../mock-data/index";
import type { STEMExam } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatDateTime, formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { ExamCreateWizard } from "./ExamCreateWizard";

/* ================================================================ */
/*  STEM EXAM ECOSYSTEM (Supplier) — NCC điều phối hệ sinh thái thi  */
/* ================================================================ */

// V1 scope: school-level only — district/province/national → V2
const LEVEL_META: Record<STEMExam["level"], { label: string; color: string; icon: typeof SchoolIcon; v2?: boolean }> = {
  school:   { label: "Cấp trường",     color: "#64748b", icon: SchoolIcon },
  district: { label: "Cấp Quận/Huyện", color: "#0891b2", icon: SchoolIcon, v2: true },
  province: { label: "Cấp Tỉnh/TP",    color: "#7c3aed", icon: SchoolIcon, v2: true },
  national: { label: "Cấp Quốc gia",   color: "#dc2626", icon: SchoolIcon, v2: true },
};

const STATUS_META: Record<STEMExam["status"], { label: string; color: string }> = {
  upcoming: { label: "Sắp diễn ra", color: "#0891b2" },
  open:     { label: "Đang mở",     color: "#16a34a" },
  closed:   { label: "Đã đóng",     color: "#64748b" },
  graded:   { label: "Đã chấm",     color: "#c8a84e" },
};

export function STEMExamEcosystem() {
  const navigate = useNavigate();

  // V1: chỉ hỗ trợ kỳ thi cấp trường — local state để wizard thêm kỳ thi mới
  const [schoolExams, setSchoolExams] = useState<STEMExam[]>(
    () => stemExams.filter((e) => e.level === "school"),
  );

  const [levelFilter, setLevelFilter] = useState<STEMExam["level"] | "all">("all");
  const [statusFilter, setStatusFilter] = useState<STEMExam["status"] | "all">("all");
  const [wizardOpen, setWizardOpen] = useState(false);

  const filtered = useMemo(() => schoolExams.filter((e) => {
    if (levelFilter !== "all" && e.level !== levelFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  }), [levelFilter, statusFilter, schoolExams]);

  const totalParticipants = schoolExams.reduce((s, e) => s + (e.totalParticipants || 0), 0);
  const upcomingCount = schoolExams.filter((e) => e.status === "upcoming").length;
  const openCount = schoolExams.filter((e) => e.status === "open").length;
  const gradedCount = schoolExams.filter((e) => e.status === "graded").length;

  // Distribution — V1 only school level
  const byLevel = useMemo(() => ([{
    level: LEVEL_META.school.label,
    count: schoolExams.length,
    fill: LEVEL_META.school.color,
  }]), [schoolExams]);

  // Participation trend — tính từ data thực theo tháng openAt
  const trend = useMemo(() => {
    const map = new Map<string, number>();
    schoolExams.forEach((e) => {
      const d = new Date(e.openAt);
      const key = `T${d.getMonth() + 1}`;
      map.set(key, (map.get(key) ?? 0) + (e.totalParticipants ?? 0));
    });
    return Array.from(map.entries())
      .map(([month, participants]) => ({ month, participants }))
      .slice(-6);
  }, [schoolExams]);

  // Top 5 exams by participants
  const topExams = [...schoolExams]
    .filter((e) => e.totalParticipants)
    .sort((a, b) => (b.totalParticipants || 0) - (a.totalParticipants || 0))
    .slice(0, 5);

  const handleCreateExam = (exam: STEMExam) => {
    setSchoolExams((prev) => [exam, ...prev]);
    toast.success(`Đã tạo kỳ thi "${exam.name}"`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ClipboardCheck}
        title="Hệ sinh thái Kỳ thi STEM"
        subtitle="Tạo và quản lý kỳ thi STEM cấp trường — đa chương trình CT1–CT5, tự động chấm điểm và công bố kết quả."
        accentColor="#990803"
        actions={
          <>
            <Link to="/supplier/exams/questions"
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Calendar className="w-4 h-4" /> Ngân hàng câu hỏi
            </Link>
            <button onClick={() => setWizardOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Tạo kỳ thi
            </button>
          </>
        }
      />

      {/* V1 scope notice */}
      <div className="flex items-start gap-2.5 p-3 bg-[#0891b2]/8 border border-[#0891b2]/25 rounded-lg">
        <Info className="w-4 h-4 text-[#0891b2] shrink-0 mt-0.5" />
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
          <strong className="text-foreground">V1:</strong> Hiện tại hỗ trợ kỳ thi <strong>cấp trường</strong>.
          Kỳ thi cấp quận/huyện, tỉnh/TP và quốc gia sẽ ra mắt tại <strong>V2</strong>.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={ClipboardCheck} label="Tổng kỳ thi" value={schoolExams.length} color="#990803" subtitle="Cấp trường" />
        <KpiCard icon={Clock} label="Sắp diễn ra" value={upcomingCount} color="#0891b2" />
        <KpiCard icon={PlayCircle} label="Đang mở thi" value={openCount} color="#16a34a" subtitle={`${totalParticipants.toLocaleString()} thí sinh`} />
        <KpiCard icon={Award} label="Đã chấm / công bố" value={gradedCount} color="#c8a84e" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 lg:col-span-2">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Users className="w-4 h-4 inline mr-1.5" /> Xu hướng thí sinh 6 tháng
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} thí sinh`} />
              <Line type="monotone" dataKey="participants" stroke="#990803" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bổ theo cấp</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byLevel} dataKey="count" cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={3}
                label={(e) => `${e.count}`}>
                {byLevel.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {byLevel.map((d) => (
              <div key={d.level} className="flex items-center gap-2" style={{ fontSize: "10.5px" }}>
                <span className="w-2 h-2 rounded" style={{ backgroundColor: d.fill }} />
                <span className="flex-1 text-muted-foreground">{d.level}</span>
                <strong>{d.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Cấp:</span>
        <button onClick={() => setLevelFilter("all")}
          className={`px-3 py-1.5 rounded-lg border ${levelFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả
        </button>
        {(Object.keys(LEVEL_META) as STEMExam["level"][]).map((lv) => {
          const meta = LEVEL_META[lv];
          const active = levelFilter === lv;
          const isV2 = meta.v2;
          return (
            <button key={lv}
              onClick={() => !isV2 && setLevelFilter(lv)}
              disabled={isV2}
              className={`relative px-3 py-1.5 rounded-lg border ${
                isV2
                  ? "bg-card border-border opacity-50 cursor-not-allowed"
                  : active
                    ? "text-white border-transparent"
                    : "bg-card border-border hover:bg-secondary"
              }`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(active && !isV2 ? { backgroundColor: meta.color } : {}),
              }}>
              {meta.label}
              {isV2 && (
                <span className="ml-1.5 px-1 py-0.5 bg-[#0891b2] text-white rounded"
                  style={{ fontSize: "9px", fontWeight: 700, verticalAlign: "middle" }}>
                  V2
                </span>
              )}
            </button>
          );
        })}
        <div className="h-5 w-px bg-border mx-1" />
        <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Trạng thái:</span>
        {(["all", ...Object.keys(STATUS_META)] as Array<"all" | STEMExam["status"]>).map((st) => (
          <button key={st} onClick={() => setStatusFilter(st as any)}
            className={`px-3 py-1.5 rounded-lg border ${statusFilter === st ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            {st === "all" ? "Tất cả" : STATUS_META[st as STEMExam["status"]].label}
          </button>
        ))}
      </div>

      {/* Exams list */}
      <div className="space-y-3">
        {filtered.map((e) => {
          const lMeta = LEVEL_META[e.level];
          const sMeta = STATUS_META[e.status];
          const LIcon = lMeta.icon;
          return (
            <div key={e.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: lMeta.color + "15" }}>
                  <LIcon className="w-6 h-6" style={{ color: lMeta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <h3 className="text-foreground" style={{ fontSize: "14.5px", fontWeight: 700 }}>{e.name}</h3>
                    <span className="px-2 py-0.5 rounded" style={{
                      fontSize: "10.5px", fontWeight: 600,
                      color: lMeta.color, backgroundColor: lMeta.color + "15",
                    }}>{lMeta.label}</span>
                    <span className="px-2 py-0.5 rounded" style={{
                      fontSize: "10.5px", fontWeight: 600,
                      color: sMeta.color, backgroundColor: sMeta.color + "15",
                    }}>{sMeta.label}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {e.programCodes.map((c) => <ProgramBadge key={c} code={c} size="xs" />)}
                    <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                      · {e.gradeLevel} · {e.durationMinutes >= 1440 ? `${Math.floor(e.durationMinutes / 1440)} ngày` : `${e.durationMinutes}p`}
                      · {e.questionCount} câu
                    </span>
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                    <span style={{ fontWeight: 500 }}>Đơn vị tổ chức:</span> {e.organiser}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Bắt đầu</p>
                  <p style={{ fontSize: "12.5px", fontWeight: 600 }}>{formatDateTime(e.openAt)}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{formatRelative(e.openAt)}</p>
                  {e.totalParticipants && (
                    <div className="mt-1 inline-flex items-center gap-1 text-[#16a34a]">
                      <Users className="w-3 h-3" />
                      <span style={{ fontSize: "12px", fontWeight: 600 }}>{e.totalParticipants.toLocaleString()} TS</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                <button onClick={() => navigate(`/supplier/exams/${e.id}`)}
                  className="px-3 py-1.5 border border-border rounded hover:bg-secondary flex items-center gap-1"
                  style={{ fontSize: "11.5px", fontWeight: 500 }}>
                  <ClipboardCheck className="w-3.5 h-3.5" /> Chi tiết
                </button>
                {e.status === "graded" && (
                  <button onClick={() => navigate(`/supplier/exams/${e.id}`)}
                    className="px-3 py-1.5 bg-[#c8a84e]/15 text-[#c8a84e] rounded flex items-center gap-1"
                    style={{ fontSize: "11.5px", fontWeight: 600 }}>
                    <Award className="w-3.5 h-3.5" /> Bảng điểm
                  </button>
                )}
                {e.status === "closed" && (
                  <button onClick={() => navigate(`/supplier/exams/${e.id}`)}
                    className="px-3 py-1.5 bg-[#c8a84e] text-white rounded flex items-center gap-1"
                    style={{ fontSize: "11.5px", fontWeight: 600 }}>
                    <Award className="w-3.5 h-3.5" /> Chấm điểm
                  </button>
                )}
                <span className="ml-auto text-muted-foreground font-mono" style={{ fontSize: "10.5px" }}>{e.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top participation */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-[#16a34a]" />
          Top 5 kỳ thi theo số thí sinh
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topExams.map((e) => ({
            name: e.name.length > 30 ? e.name.slice(0, 30) + "..." : e.name,
            participants: e.totalParticipants || 0,
          }))} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="participants" fill="#990803" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ExamCreateWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreate={handleCreateExam}
      />
    </div>
  );
}

export default STEMExamEcosystem;
