import { useState } from "react";
import {
  KeyRound, Search, UserPlus, UserMinus, CheckCircle2, AlertTriangle,
  Users, RefreshCw, Download, Filter, ChevronDown, GraduationCap,
} from "lucide-react";
import { licensesByTenant, tenantsByType } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";
import { cn } from "../ui/utils";

/* ================================================================ */
/*  LICENSE ASSIGN — Gán / Thu hồi license cho GV và HS              */
/* ================================================================ */

type LicenseStatus = "assigned" | "unassigned" | "expired";

interface TeacherLicense {
  id: string;
  name: string;
  subject: string;
  email: string;
  licenseKey: string | null;
  programCode: string;
  licenseStatus: LicenseStatus;
}

interface StudentLicense {
  id: string;
  name: string;
  className: string;
  grade: number;
  licenseKey: string | null;
  programCode: string;
  licenseStatus: LicenseStatus;
}

const TEACHER_LIST: TeacherLicense[] = [
  { id: "U-TCH-01", name: "Phạm Anh Tuấn",    subject: "Toán",                  email: "gv1@thcs-school.edu.vn",  licenseKey: "GLX-AKVT-XMPL-0001", programCode: "CT1", licenseStatus: "assigned" },
  { id: "U-TCH-02", name: "Nguyễn Thị Lan",   subject: "Lý",                    email: "gv2@thcs-school.edu.vn",  licenseKey: "GLX-BRVL-XMPL-0002", programCode: "CT2", licenseStatus: "assigned" },
  { id: "U-TCH-03", name: "Trần Văn Hùng",    subject: "Hóa",                   email: "gv3@thcs-school.edu.vn",  licenseKey: null,                  programCode: "CT3", licenseStatus: "unassigned" },
  { id: "U-TCH-04", name: "Lê Minh Trang",    subject: "Sinh",                  email: "gv4@thcs-school.edu.vn",  licenseKey: "GLX-CDEF-XMPL-0004", programCode: "CT1", licenseStatus: "expired" },
  { id: "U-TCH-05", name: "Vũ Thanh Hương",   subject: "Tin học",               email: "gv5@thcs-school.edu.vn",  licenseKey: "GLX-DGHK-XMPL-0005", programCode: "CT2", licenseStatus: "assigned" },
  { id: "U-TCH-06", name: "Đặng Tuấn Anh",   subject: "Công nghệ",              email: "gv6@thcs-school.edu.vn",  licenseKey: null,                  programCode: "CT4", licenseStatus: "unassigned" },
  { id: "U-TCH-07", name: "Bùi Thu Hà",       subject: "Khoa học Tự nhiên",     email: "gv7@thcs-school.edu.vn",  licenseKey: "GLX-FHJK-XMPL-0007", programCode: "CT3", licenseStatus: "assigned" },
  { id: "U-TCH-08", name: "Nguyễn Văn Dũng",  subject: "Vật lý",                email: "gv8@thcs-school.edu.vn",  licenseKey: "GLX-GJLM-XMPL-0008", programCode: "CT5", licenseStatus: "expired" },
];

const STUDENT_LIST: StudentLicense[] = [
  { id: "S-001", name: "Nguyễn Minh An",      className: "Lớp 6A", grade: 6, licenseKey: "GLX-S001-XMPL-1001", programCode: "CT1", licenseStatus: "assigned" },
  { id: "S-002", name: "Trần Thị Bích",       className: "Lớp 6A", grade: 6, licenseKey: "GLX-S002-XMPL-1002", programCode: "CT1", licenseStatus: "assigned" },
  { id: "S-003", name: "Lê Quang Duy",        className: "Lớp 6B", grade: 6, licenseKey: null,                  programCode: "CT2", licenseStatus: "unassigned" },
  { id: "S-004", name: "Phạm Thùy Linh",      className: "Lớp 6B", grade: 6, licenseKey: "GLX-S004-XMPL-1004", programCode: "CT1", licenseStatus: "expired" },
  { id: "S-005", name: "Hoàng Văn Nam",       className: "Lớp 7A", grade: 7, licenseKey: "GLX-S005-XMPL-1005", programCode: "CT2", licenseStatus: "assigned" },
  { id: "S-006", name: "Vũ Thị Thu",          className: "Lớp 7A", grade: 7, licenseKey: null,                  programCode: "CT2", licenseStatus: "unassigned" },
  { id: "S-007", name: "Đỗ Tiến Đạt",        className: "Lớp 7B", grade: 7, licenseKey: "GLX-S007-XMPL-1007", programCode: "CT3", licenseStatus: "assigned" },
  { id: "S-008", name: "Đinh Khánh Ly",       className: "Lớp 7B", grade: 7, licenseKey: "GLX-S008-XMPL-1008", programCode: "CT2", licenseStatus: "assigned" },
  { id: "S-009", name: "Nguyễn Bảo Long",     className: "Lớp 7C", grade: 7, licenseKey: null,                  programCode: "CT4", licenseStatus: "unassigned" },
  { id: "S-010", name: "Trần Thanh Mai",      className: "Lớp 7C", grade: 7, licenseKey: "GLX-S010-XMPL-1010", programCode: "CT3", licenseStatus: "expired" },
  { id: "S-011", name: "Phan Tuấn Khải",     className: "Lớp 8A", grade: 8, licenseKey: "GLX-S011-XMPL-1011", programCode: "CT3", licenseStatus: "assigned" },
  { id: "S-012", name: "Lý Thị Ngọc",        className: "Lớp 8A", grade: 8, licenseKey: "GLX-S012-XMPL-1012", programCode: "CT3", licenseStatus: "assigned" },
  { id: "S-013", name: "Cao Minh Phúc",       className: "Lớp 8B", grade: 8, licenseKey: null,                  programCode: "CT4", licenseStatus: "unassigned" },
  { id: "S-014", name: "Bùi Lan Anh",         className: "Lớp 8B", grade: 8, licenseKey: "GLX-S014-XMPL-1014", programCode: "CT4", licenseStatus: "assigned" },
  { id: "S-015", name: "Dương Quốc Huy",      className: "Lớp 8C", grade: 8, licenseKey: "GLX-S015-XMPL-1015", programCode: "CT3", licenseStatus: "expired" },
  { id: "S-016", name: "Hà Phương Thảo",     className: "Lớp 9A", grade: 9, licenseKey: "GLX-S016-XMPL-1016", programCode: "CT5", licenseStatus: "assigned" },
  { id: "S-017", name: "Lê Văn Khoa",         className: "Lớp 9A", grade: 9, licenseKey: "GLX-S017-XMPL-1017", programCode: "CT5", licenseStatus: "assigned" },
  { id: "S-018", name: "Nguyễn Thu Hà",       className: "Lớp 9B", grade: 9, licenseKey: null,                  programCode: "CT5", licenseStatus: "unassigned" },
  { id: "S-019", name: "Trần Đức Anh",        className: "Lớp 9B", grade: 9, licenseKey: "GLX-S019-XMPL-1019", programCode: "CT5", licenseStatus: "expired" },
  { id: "S-020", name: "Vũ Bảo Châu",         className: "Lớp 9C", grade: 9, licenseKey: "GLX-S020-XMPL-1020", programCode: "CT5", licenseStatus: "assigned" },
];

const STATUS_META: Record<LicenseStatus, { label: string; color: string; bg: string }> = {
  assigned:   { label: "Đã gán",    color: "#16a34a", bg: "#16a34a15" },
  unassigned: { label: "Chưa gán",  color: "#64748b", bg: "#64748b15" },
  expired:    { label: "Hết hạn",   color: "#dc2626", bg: "#dc262615" },
};

function StatusBadge({ status }: { status: LicenseStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
      style={{ fontSize: "10px", fontWeight: 600, color: meta.color, backgroundColor: meta.bg }}
    >
      {status === "assigned" && <CheckCircle2 className="w-3 h-3" />}
      {status === "expired" && <AlertTriangle className="w-3 h-3" />}
      {meta.label}
    </span>
  );
}

function maskKey(key: string | null): string {
  if (!key) return "—";
  return key.slice(0, 8) + "...";
}

export function LicenseAssign() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const licenses = licensesByTenant(tenantId);

  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");

  // KPI from pool
  const totalPool = licenses.reduce((s, l) => s + (l.seats > 0 ? l.seats : 0), 0);
  const usedPool  = licenses.reduce((s, l) => s + l.seatsUsed, 0);
  const freePool  = totalPool - usedPool;
  const expiringSoon = licenses.filter(
    (l) => !l.revokedAt && new Date(l.expiresAt).getTime() - Date.now() < 30 * 86400_000
  ).length;

  // Filter helpers
  function filteredTeachers() {
    return TEACHER_LIST.filter((t) => {
      if (programFilter !== "all" && t.programCode !== programFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!t.name.toLowerCase().includes(s) && !t.email.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }

  function filteredStudents() {
    return STUDENT_LIST.filter((s) => {
      if (programFilter !== "all" && s.programCode !== programFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.className.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  const programs = ["all", "CT1", "CT2", "CT3", "CT4", "CT5"];

  return (
    <div className="space-y-5">
      {/* ── PageHeader ── */}
      <PageHeader
        icon={KeyRound}
        title="Gán / Thu hồi License"
        subtitle="Quản lý phân bổ license phần mềm STEM cho giáo viên và học sinh."
        accentColor="#2563eb"
        actions={
          <>
            <button
              onClick={() => toast.info("Mở giao diện phân bổ license hàng loạt từ danh sách Excel")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <UserPlus className="w-4 h-4" /> Phân bổ hàng loạt
            </button>
            <button
              onClick={() => toast.info("Xuất báo cáo phân bổ license theo lớp / GV ra Excel")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Download className="w-4 h-4" /> Xuất báo cáo
            </button>
          </>
        }
      />

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={KeyRound}       label="Tổng license trong pool"  value={totalPool}    color="#2563eb" />
        <KpiCard icon={CheckCircle2}   label="Đã cấp phát"              value={usedPool}     color="#16a34a" />
        <KpiCard icon={Users}          label="Còn trống"                value={freePool}     color="#7c3aed" />
        <KpiCard icon={AlertTriangle}  label="Sắp hết hạn (30 ngày)"   value={expiringSoon} color="#f59e0b" />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {(["teachers", "students"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch(""); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all",
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            {tab === "teachers" ? <Users className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
            {tab === "teachers" ? "Giáo viên" : "Học sinh"}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === "teachers" ? "Tìm giáo viên..." : "Tìm học sinh, lớp..."}
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#2563eb]"
            style={{ fontSize: "13px" }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "12.5px", fontWeight: 500 }}
          >
            {programs.map((p) => (
              <option key={p} value={p}>{p === "all" ? "Tất cả CT" : p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Teacher Table ── */}
      {activeTab === "teachers" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                <tr>
                  <th className="px-4 py-2.5">Họ tên</th>
                  <th className="px-4 py-2.5">Môn dạy</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">CT STEM</th>
                  <th className="px-4 py-2.5">License Key</th>
                  <th className="px-4 py-2.5">Trạng thái</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
                {filteredTeachers().map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-white"
                          style={{ fontSize: "11px", backgroundColor: "#2563eb" }}
                        >
                          {t.name.split(" ").map((w) => w[0]).slice(-2).join("")}
                        </div>
                        <span style={{ fontWeight: 600 }}>{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>{t.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-md"
                        style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", backgroundColor: "#2563eb15" }}
                      >
                        {t.programCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground" style={{ fontSize: "11px" }}>
                      {maskKey(t.licenseKey)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.licenseStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.licenseStatus === "unassigned" && (
                        <button
                          onClick={() => toast.success(`Đã gán license cho ${t.name}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2563eb]/10 text-[#2563eb] hover:bg-[#2563eb]/20 transition-colors"
                          style={{ fontSize: "11.5px", fontWeight: 600 }}
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Gán license
                        </button>
                      )}
                      {t.licenseStatus === "assigned" && (
                        <button
                          onClick={() => toast.warning(`Đã thu hồi license của ${t.name}. License được trả về pool.`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                          style={{ fontSize: "11.5px", fontWeight: 600 }}
                        >
                          <UserMinus className="w-3.5 h-3.5" /> Thu hồi
                        </button>
                      )}
                      {t.licenseStatus === "expired" && (
                        <button
                          onClick={() => toast.info(`Yêu cầu gia hạn license cho ${t.name} đã được gửi`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"
                          style={{ fontSize: "11.5px", fontWeight: 600 }}
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Gia hạn
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTeachers().length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                      Không tìm thấy giáo viên phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Student Table ── */}
      {activeTab === "students" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                <tr>
                  <th className="px-4 py-2.5">Họ tên</th>
                  <th className="px-4 py-2.5">Lớp</th>
                  <th className="px-4 py-2.5">Khối</th>
                  <th className="px-4 py-2.5">CT STEM</th>
                  <th className="px-4 py-2.5">License Key</th>
                  <th className="px-4 py-2.5">Trạng thái</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
                {filteredStudents().map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.className}</td>
                    <td className="px-4 py-3 text-muted-foreground">Khối {s.grade}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-md"
                        style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", backgroundColor: "#7c3aed15" }}
                      >
                        {s.programCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground" style={{ fontSize: "11px" }}>
                      {maskKey(s.licenseKey)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.licenseStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.licenseStatus === "unassigned" && (
                        <button
                          onClick={() => toast.success(`Đã gán license cho học sinh ${s.name}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2563eb]/10 text-[#2563eb] hover:bg-[#2563eb]/20 transition-colors"
                          style={{ fontSize: "11.5px", fontWeight: 600 }}
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Gán license
                        </button>
                      )}
                      {s.licenseStatus === "assigned" && (
                        <button
                          onClick={() => toast.warning(`Đã thu hồi license của học sinh ${s.name}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                          style={{ fontSize: "11.5px", fontWeight: 600 }}
                        >
                          <UserMinus className="w-3.5 h-3.5" /> Thu hồi
                        </button>
                      )}
                      {s.licenseStatus === "expired" && (
                        <button
                          onClick={() => toast.info(`Đã gửi yêu cầu gia hạn license cho học sinh ${s.name}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"
                          style={{ fontSize: "11.5px", fontWeight: 600 }}
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Gia hạn
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredStudents().length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                      Không tìm thấy học sinh phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Bulk Action Bar (demo: 3 selected) ── */}
      <div className="sticky bottom-4 flex items-center justify-between gap-4 bg-card border border-[#2563eb]/30 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2563eb] flex items-center justify-center text-white" style={{ fontSize: "12px", fontWeight: 700 }}>3</div>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>người được chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success("Đã gán license thành công cho 3 người được chọn")}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            <UserPlus className="w-4 h-4" />
            Gán license cho 3 người được chọn
          </button>
          <button
            onClick={() => toast.warning("Đã thu hồi license của 3 người được chọn")}
            className="flex items-center gap-1.5 px-3 py-2 border border-orange-300 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <UserMinus className="w-4 h-4" /> Thu hồi
          </button>
        </div>
      </div>
    </div>
  );
}

export default LicenseAssign;
