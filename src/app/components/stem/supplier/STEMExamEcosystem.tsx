import { useState, useMemo } from "react";
import {
  ClipboardCheck, Plus, Calendar, Users, Award, Download,
  Landmark, School as SchoolIcon, Building2, Globe,
  Clock, CheckCircle2,
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
import { toast } from "sonner";

/* ================================================================ */
/*  STEM EXAM ECOSYSTEM (Supplier) — NCC điều phối hệ sinh thái thi  */
/* ================================================================ */

const LEVEL_META: Record<STEMExam["level"], { label: string; color: string; icon: typeof SchoolIcon }> = {
  school:   { label: "Cấp trường",     color: "#64748b", icon: SchoolIcon },
  district: { label: "Cấp Quận/Huyện", color: "#0891b2", icon: Building2 },
  province: { label: "Cấp Tỉnh/TP",    color: "#7c3aed", icon: Landmark },
  national: { label: "Cấp Quốc gia",   color: "#dc2626", icon: Globe },
};

const STATUS_META: Record<STEMExam["status"], { label: string; color: string }> = {
  upcoming: { label: "Sắp diễn ra", color: "#0891b2" },
  open:     { label: "Đang mở",     color: "#16a34a" },
  closed:   { label: "Đã đóng",     color: "#64748b" },
  graded:   { label: "Đã chấm",     color: "#c8a84e" },
};

export function STEMExamEcosystem() {
  const [levelFilter, setLevelFilter] = useState<STEMExam["level"] | "all">("all");
  const [statusFilter, setStatusFilter] = useState<STEMExam["status"] | "all">("all");

  const filtered = useMemo(() => stemExams.filter((e) => {
    if (levelFilter !== "all" && e.level !== levelFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  }), [levelFilter, statusFilter]);

  const totalParticipants = stemExams.reduce((s, e) => s + (e.totalParticipants || 0), 0);
  const upcomingCount = stemExams.filter((e) => e.status === "upcoming").length;
  const openCount = stemExams.filter((e) => e.status === "open").length;
  const gradedCount = stemExams.filter((e) => e.status === "graded").length;

  // Distribution by level
  const byLevel = useMemo(() => (Object.keys(LEVEL_META) as STEMExam["level"][]).map((lv) => ({
    level: LEVEL_META[lv].label,
    count: stemExams.filter((e) => e.level === lv).length,
    fill: LEVEL_META[lv].color,
  })), []);

  // Participation trend (mock by month)
  const trend = [
    { month: "T11", participants: 420 },
    { month: "T12", participants: 580 },
    { month: "T1", participants: 680 },
    { month: "T2", participants: 750 },
    { month: "T3", participants: 890 },
    { month: "T4", participants: 1020 },
  ];

  // Top 5 exams by participants
  const topExams = [...stemExams]
    .filter((e) => e.totalParticipants)
    .sort((a, b) => (b.totalParticipants || 0) - (a.totalParticipants || 0))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ClipboardCheck}
        title="Hệ sinh thái Kỳ thi STEM"
        subtitle="Điều phối hệ thống kỳ thi STEM 4 cấp — từ trường, quận/huyện đến cấp tỉnh/quốc gia."
        accentColor="#990803"
        actions={
          <>
            <button onClick={() => toast.info("Xuất danh sách kỳ thi cho các Sở GD&ĐT")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất lịch
            </button>
            <button onClick={() => toast.success("Mở wizard tạo kỳ thi mới")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Tạo kỳ thi
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={ClipboardCheck} label="Tổng kỳ thi" value={stemExams.length} color="#990803" subtitle="Trong hệ sinh thái" />
        <KpiCard icon={Clock} label="Sắp diễn ra" value={upcomingCount} color="#0891b2" />
        <KpiCard icon={Users} label="Tổng thí sinh" value={totalParticipants.toLocaleString()} color="#16a34a" change="+28%" trend="up" />
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
          return (
            <button key={lv} onClick={() => setLevelFilter(lv)}
              className={`px-3 py-1.5 rounded-lg border ${active ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(active ? { backgroundColor: meta.color } : {}),
              }}>
              {meta.label}
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
                <button onClick={() => toast.info(`Chi tiết ${e.name}`)}
                  className="px-3 py-1.5 border border-border rounded hover:bg-secondary flex items-center gap-1"
                  style={{ fontSize: "11.5px", fontWeight: 500 }}>
                  <ClipboardCheck className="w-3.5 h-3.5" /> Chi tiết
                </button>
                <button onClick={() => toast.info(`Ngân hàng câu hỏi kỳ thi`)}
                  className="px-3 py-1.5 border border-border rounded hover:bg-secondary flex items-center gap-1"
                  style={{ fontSize: "11.5px", fontWeight: 500 }}>
                  <Calendar className="w-3.5 h-3.5" /> Ngân hàng câu hỏi
                </button>
                {e.status === "graded" && (
                  <button onClick={() => toast.info(`Xem bảng điểm`)}
                    className="px-3 py-1.5 bg-[#c8a84e]/15 text-[#c8a84e] rounded flex items-center gap-1"
                    style={{ fontSize: "11.5px", fontWeight: 600 }}>
                    <Award className="w-3.5 h-3.5" /> Bảng điểm
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
    </div>
  );
}

export default STEMExamEcosystem;
