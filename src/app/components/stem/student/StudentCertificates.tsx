import {
  Award, Download, Eye, CheckCircle2, Calendar,
  Lock, Sparkles, Share2,
} from "lucide-react";
import { STEM_PROGRAMS } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatDate } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  STUDENT CERTIFICATES — chứng chỉ STEM cá nhân                   */
/* ================================================================ */

interface Cert {
  id: string;
  title: string;
  program: StemProgram;
  level: "Basic" | "Intermediate" | "Advanced" | "Expert";
  issuedAt: string;
  issuer: string;
  earned: boolean;
  certNo?: string;
  progress?: number;
}

const CERTS: Cert[] = [
  { id: "C1", title: "Chứng chỉ STEM CT1 — Tích hợp cơ bản", program: "CT1", level: "Basic",
    issuedAt: "2025-12-15", issuer: "Geleximco STEM", earned: true, certNo: "GLX-STEM-CT1-00123" },
  { id: "C2", title: "Chứng chỉ STEM CT2 — Liên môn Toán-Lý", program: "CT2", level: "Intermediate",
    issuedAt: "2026-02-10", issuer: "Geleximco STEM", earned: true, certNo: "GLX-STEM-CT2-00098" },
  { id: "C3", title: "Chứng chỉ Robotic Cơ bản", program: "CT4", level: "Basic",
    issuedAt: "", issuer: "Geleximco STEM + IEEE VN", earned: false, progress: 75 },
  { id: "C4", title: "Chứng chỉ AI for Kids", program: "CT4", level: "Intermediate",
    issuedAt: "", issuer: "Geleximco STEM", earned: false, progress: 40 },
  { id: "C5", title: "Chứng chỉ Đề tài NCKH Đầu tiên", program: "CT5", level: "Advanced",
    issuedAt: "", issuer: "Sở GD&ĐT Hà Nội", earned: false, progress: 0 },
];

const LEVEL_COLOR: Record<Cert["level"], string> = {
  Basic: "#64748b",
  Intermediate: "#0891b2",
  Advanced: "#7c3aed",
  Expert: "#c8a84e",
};

export function StudentCertificates() {
  const earned = CERTS.filter((c) => c.earned);
  const inProgress = CERTS.filter((c) => !c.earned);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Award}
        title="Chứng chỉ STEM của tôi"
        subtitle="Chứng chỉ đã đạt và đang trên hành trình chinh phục."
        accentColor="#c8a84e"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Award} label="Đã đạt" value={earned.length} color="#16a34a" />
        <KpiCard icon={Sparkles} label="Đang học" value={inProgress.filter((c) => (c.progress || 0) > 0).length} color="#7c3aed" />
        <KpiCard icon={Lock} label="Chưa mở" value={inProgress.filter((c) => (c.progress || 0) === 0).length} color="#64748b" />
        <KpiCard icon={CheckCircle2} label="Tổng chứng chỉ" value={CERTS.length} color="#c8a84e" />
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div>
          <h2 className="text-foreground mb-3" style={{ fontSize: "15px", fontWeight: 700 }}>
            <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-[#16a34a]" />
            Đã đạt ({earned.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {earned.map((c) => (
              <div key={c.id} className="bg-card rounded-xl border border-[#c8a84e]/40 overflow-hidden hover:shadow-lg transition-all">
                <div className="p-4 bg-gradient-to-br from-[#c8a84e]/20 to-[#990803]/5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Award className="w-7 h-7 text-[#c8a84e]" />
                    </div>
                    <span className="px-2 py-0.5 bg-[#16a34a] text-white rounded inline-flex items-center gap-1" style={{ fontSize: "10px", fontWeight: 600 }}>
                      <CheckCircle2 className="w-3 h-3" /> Đã xác thực
                    </span>
                  </div>
                  <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{c.title}</h3>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "11.5px" }}>
                    Cấp bởi {c.issuer}
                  </p>
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Chương trình</p>
                      <div className="mt-1"><ProgramBadge code={c.program} size="sm" showName /></div>
                    </div>
                    <div>
                      <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Cấp độ</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded" style={{
                        fontSize: "11px", fontWeight: 600,
                        color: LEVEL_COLOR[c.level], backgroundColor: LEVEL_COLOR[c.level] + "15",
                      }}>
                        {c.level}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Cấp ngày</p>
                    <p style={{ fontSize: "12px", fontWeight: 500 }}>
                      <Calendar className="w-3 h-3 inline mr-0.5" />
                      {formatDate(c.issuedAt)}
                    </p>
                  </div>
                  {c.certNo && (
                    <div>
                      <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Mã chứng chỉ</p>
                      <p className="font-mono" style={{ fontSize: "11px" }}>{c.certNo}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => toast.info(`Xem chứng chỉ ${c.title}`)}
                      className="flex-1 px-3 py-1.5 border border-border rounded hover:bg-secondary flex items-center justify-center gap-1"
                      style={{ fontSize: "11.5px", fontWeight: 500 }}>
                      <Eye className="w-3 h-3" /> Xem
                    </button>
                    <button onClick={() => toast.success(`Đã tải PDF chứng chỉ`)}
                      className="flex-1 px-3 py-1.5 bg-[#c8a84e] text-white rounded hover:opacity-90 flex items-center justify-center gap-1"
                      style={{ fontSize: "11.5px", fontWeight: 500 }}>
                      <Download className="w-3 h-3" /> Tải PDF
                    </button>
                    <button onClick={() => toast.info(`Chia sẻ lên mạng xã hội`)}
                      className="px-2 py-1.5 border border-border rounded hover:bg-secondary" title="Chia sẻ">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In progress / locked */}
      <div>
        <h2 className="text-foreground mb-3" style={{ fontSize: "15px", fontWeight: 700 }}>
          <Sparkles className="w-4 h-4 inline mr-1.5 text-[#7c3aed]" />
          Đang chinh phục ({inProgress.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {inProgress.map((c) => (
            <div key={c.id} className={`bg-card rounded-xl border border-border p-4 ${c.progress === 0 ? "opacity-70" : ""}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  {c.progress === 0 ? <Lock className="w-5 h-5 text-muted-foreground" /> : <Award className="w-5 h-5 text-[#7c3aed]" />}
                </div>
                <ProgramBadge code={c.program} size="xs" />
              </div>
              <h3 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{c.title}</h3>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>{c.issuer}</p>
              {c.progress !== undefined && c.progress > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Tiến độ</span>
                    <span style={{ fontSize: "10.5px", fontWeight: 600 }}>{c.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-[#7c3aed]" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
              )}
              {c.progress === 0 && (
                <p className="mt-2 text-muted-foreground italic" style={{ fontSize: "10.5px" }}>
                  <Lock className="w-3 h-3 inline mr-0.5" /> Hoàn thành các bài CT5 để mở khóa
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentCertificates;
