import { useState } from "react";
import {
  KeyRound, Search, UserPlus, UserMinus, CheckCircle2, AlertTriangle,
  Users, Download, Filter, GraduationCap, X,
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

type LicenseStatus = "assigned" | "unassigned";

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
  { id: "U-TCH-01", name: "Phạm Anh Tuấn",    subject: "Toán",              email: "gv1@thcs-school.edu.vn",  licenseKey: "GLX-AKVT-XMPL-0001", programCode: "CT1", licenseStatus: "assigned" },
  { id: "U-TCH-02", name: "Nguyễn Thị Lan",   subject: "Lý",                email: "gv2@thcs-school.edu.vn",  licenseKey: "GLX-BRVL-XMPL-0002", programCode: "CT2", licenseStatus: "assigned" },
  { id: "U-TCH-03", name: "Trần Văn Hùng",    subject: "Hóa",               email: "gv3@thcs-school.edu.vn",  licenseKey: null,                  programCode: "CT3", licenseStatus: "unassigned" },
  { id: "U-TCH-04", name: "Lê Minh Trang",    subject: "Sinh",              email: "gv4@thcs-school.edu.vn",  licenseKey: null,                  programCode: "CT1", licenseStatus: "unassigned" },
  { id: "U-TCH-05", name: "Vũ Thanh Hương",   subject: "Tin học",           email: "gv5@thcs-school.edu.vn",  licenseKey: "GLX-DGHK-XMPL-0005", programCode: "CT2", licenseStatus: "assigned" },
  { id: "U-TCH-06", name: "Đặng Tuấn Anh",   subject: "Công nghệ",          email: "gv6@thcs-school.edu.vn",  licenseKey: null,                  programCode: "CT4", licenseStatus: "unassigned" },
  { id: "U-TCH-07", name: "Bùi Thu Hà",       subject: "Khoa học Tự nhiên", email: "gv7@thcs-school.edu.vn",  licenseKey: "GLX-FHJK-XMPL-0007", programCode: "CT3", licenseStatus: "assigned" },
  { id: "U-TCH-08", name: "Nguyễn Văn Dũng",  subject: "Vật lý",            email: "gv8@thcs-school.edu.vn",  licenseKey: null,                  programCode: "CT5", licenseStatus: "unassigned" },
];

const STUDENT_LIST: StudentLicense[] = [
  { id: "S-001", name: "Nguyễn Minh An",   className: "Lớp 6A", grade: 6, licenseKey: "GLX-S001-XMPL-1001", programCode: "CT1", licenseStatus: "assigned" },
  { id: "S-002", name: "Trần Thị Bích",    className: "Lớp 6A", grade: 6, licenseKey: "GLX-S002-XMPL-1002", programCode: "CT1", licenseStatus: "assigned" },
  { id: "S-003", name: "Lê Quang Duy",     className: "Lớp 6B", grade: 6, licenseKey: null,                  programCode: "CT2", licenseStatus: "unassigned" },
  { id: "S-004", name: "Phạm Thùy Linh",   className: "Lớp 6B", grade: 6, licenseKey: null,                  programCode: "CT1", licenseStatus: "unassigned" },
  { id: "S-005", name: "Hoàng Văn Nam",    className: "Lớp 7A", grade: 7, licenseKey: "GLX-S005-XMPL-1005", programCode: "CT2", licenseStatus: "assigned" },
  { id: "S-006", name: "Vũ Thị Thu",       className: "Lớp 7A", grade: 7, licenseKey: null,                  programCode: "CT2", licenseStatus: "unassigned" },
  { id: "S-007", name: "Đỗ Tiến Đạt",     className: "Lớp 7B", grade: 7, licenseKey: "GLX-S007-XMPL-1007", programCode: "CT3", licenseStatus: "assigned" },
  { id: "S-008", name: "Đinh Khánh Ly",    className: "Lớp 7B", grade: 7, licenseKey: "GLX-S008-XMPL-1008", programCode: "CT2", licenseStatus: "assigned" },
  { id: "S-009", name: "Nguyễn Bảo Long",  className: "Lớp 7C", grade: 7, licenseKey: null,                  programCode: "CT4", licenseStatus: "unassigned" },
  { id: "S-010", name: "Trần Thanh Mai",   className: "Lớp 7C", grade: 7, licenseKey: null,                  programCode: "CT3", licenseStatus: "unassigned" },
  { id: "S-011", name: "Phan Tuấn Khải",  className: "Lớp 8A", grade: 8, licenseKey: "GLX-S011-XMPL-1011", programCode: "CT3", licenseStatus: "assigned" },
  { id: "S-012", name: "Lý Thị Ngọc",     className: "Lớp 8A", grade: 8, licenseKey: "GLX-S012-XMPL-1012", programCode: "CT3", licenseStatus: "assigned" },
  { id: "S-013", name: "Cao Minh Phúc",    className: "Lớp 8B", grade: 8, licenseKey: null,                  programCode: "CT4", licenseStatus: "unassigned" },
  { id: "S-014", name: "Bùi Lan Anh",      className: "Lớp 8B", grade: 8, licenseKey: "GLX-S014-XMPL-1014", programCode: "CT4", licenseStatus: "assigned" },
  { id: "S-015", name: "Dương Quốc Huy",   className: "Lớp 8C", grade: 8, licenseKey: null,                  programCode: "CT3", licenseStatus: "unassigned" },
  { id: "S-016", name: "Hà Phương Thảo",  className: "Lớp 9A", grade: 9, licenseKey: "GLX-S016-XMPL-1016", programCode: "CT5", licenseStatus: "assigned" },
  { id: "S-017", name: "Lê Văn Khoa",      className: "Lớp 9A", grade: 9, licenseKey: "GLX-S017-XMPL-1017", programCode: "CT5", licenseStatus: "assigned" },
  { id: "S-018", name: "Nguyễn Thu Hà",    className: "Lớp 9B", grade: 9, licenseKey: null,                  programCode: "CT5", licenseStatus: "unassigned" },
  { id: "S-019", name: "Trần Đức Anh",     className: "Lớp 9B", grade: 9, licenseKey: null,                  programCode: "CT5", licenseStatus: "unassigned" },
  { id: "S-020", name: "Vũ Bảo Châu",      className: "Lớp 9C", grade: 9, licenseKey: "GLX-S020-XMPL-1020", programCode: "CT5", licenseStatus: "assigned" },
];

const CLASS_OPTIONS = [
  { label: "Chọn lớp...", value: "", count: 0 },
  { label: "6A (38 HS)",  value: "6A",  count: 38 },
  { label: "6B (40 HS)",  value: "6B",  count: 40 },
  { label: "7A (37 HS)",  value: "7A",  count: 37 },
  { label: "7B (39 HS)",  value: "7B",  count: 39 },
  { label: "8A (36 HS)",  value: "8A",  count: 36 },
  { label: "8B (38 HS)",  value: "8B",  count: 38 },
  { label: "9A (35 HS)",  value: "9A",  count: 35 },
  { label: "9B (37 HS)",  value: "9B",  count: 37 },
];

const REVOKE_REASONS = [
  "Chuyển trường",
  "Thôi học / Nghỉ việc",
  "Vi phạm nội quy",
  "Hết hạn sử dụng",
  "Khác",
];

const STATUS_META: Record<LicenseStatus, { label: string; color: string; bg: string }> = {
  assigned:   { label: "Đã gán",   color: "#16a34a", bg: "#16a34a15" },
  unassigned: { label: "Chưa gán", color: "#64748b", bg: "#64748b15" },
};

function StatusBadge({ status }: { status: LicenseStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
      style={{ fontSize: "10px", fontWeight: 600, color: meta.color, backgroundColor: meta.bg }}
    >
      {status === "assigned" && <CheckCircle2 className="w-3 h-3" />}
      {meta.label}
    </span>
  );
}

function maskKey(key: string | null): string {
  if (!key) return "—";
  return key.slice(0, 8) + "...";
}

function genKey() {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GLX-${seg()}-${seg()}-${seg()}`;
}

export function LicenseAssign() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const licenses = licensesByTenant(tenantId);

  /* ── Local mutable lists ── */
  const [teachers, setTeachers] = useState<TeacherLicense[]>(() => [...TEACHER_LIST]);
  const [students, setStudents] = useState<StudentLicense[]>(() => [...STUDENT_LIST]);

  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");

  /* ── Revoke Dialog State ── */
  const [revokeDialog, setRevokeDialog] = useState<{
    open: boolean; userName: string; userId: string;
  } | null>(null);
  const [revokeReason, setRevokeReason] = useState(REVOKE_REASONS[0]);
  const [revokeNote, setRevokeNote] = useState("");

  /* ── Assign Dialog State ── */
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean; userId: string; userName: string; type: "teacher" | "student";
  } | null>(null);
  const [assignQty, setAssignQty] = useState("1");

  /* ── Selection State ── */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAll(ids: string[]) {
    const all = ids.length > 0 && ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => { const n = new Set(prev); all ? ids.forEach((id) => n.delete(id)) : ids.forEach((id) => n.add(id)); return n; });
  }

  /* ── Bulk-by-class State ── */
  const [bulkClass, setBulkClass] = useState("");

  /* ── State mutation helpers ── */
  function assignTeacher(id: string) {
    setTeachers((prev) => prev.map((t) => t.id === id ? { ...t, licenseStatus: "assigned", licenseKey: genKey() } : t));
  }
  function revokeTeacher(id: string) {
    setTeachers((prev) => prev.map((t) => t.id === id ? { ...t, licenseStatus: "unassigned", licenseKey: null } : t));
  }
  function assignStudent(id: string) {
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, licenseStatus: "assigned", licenseKey: genKey() } : s));
  }
  function revokeStudent(id: string) {
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, licenseStatus: "unassigned", licenseKey: null } : s));
  }

  function openAssignDialog(userId: string, userName: string, type: "teacher" | "student") {
    setAssignQty("1");
    setAssignDialog({ open: true, userId, userName, type });
  }

  function handleConfirmAssign() {
    if (!assignDialog) return;
    if (assignDialog.type === "teacher") assignTeacher(assignDialog.userId);
    else assignStudent(assignDialog.userId);
    toast.success(`Đã gán ${assignQty} license cho ${assignDialog.userName}`);
    setAssignDialog(null);
  }

  // KPI from pool
  const totalPool = licenses.reduce((s, l) => s + (l.seats > 0 ? l.seats : 0), 0);
  const usedPool  = licenses.reduce((s, l) => s + l.seatsUsed, 0);
  const freePool  = totalPool - usedPool;
  const expiringSoon = licenses.filter(
    (l) => !l.revokedAt && new Date(l.expiresAt).getTime() - Date.now() < 30 * 86400_000
  ).length;

  // Filter helpers
  function filteredTeachers() {
    return teachers.filter((t) => {
      if (programFilter !== "all" && t.programCode !== programFilter) return false;
      if (search) { const s = search.toLowerCase(); if (!t.name.toLowerCase().includes(s) && !t.email.toLowerCase().includes(s)) return false; }
      return true;
    });
  }
  function filteredStudents() {
    return students.filter((s) => {
      if (programFilter !== "all" && s.programCode !== programFilter) return false;
      if (search) { const q = search.toLowerCase(); if (!s.name.toLowerCase().includes(q) && !s.className.toLowerCase().includes(q)) return false; }
      return true;
    });
  }

  function openRevokeDialog(userId: string, userName: string) {
    setRevokeReason(REVOKE_REASONS[0]);
    setRevokeNote("");
    setRevokeDialog({ open: true, userName, userId });
  }

  function handleConfirmRevoke() {
    if (!revokeDialog) return;
    if (activeTab === "teachers") revokeTeacher(revokeDialog.userId);
    else revokeStudent(revokeDialog.userId);
    toast.success(`Đã thu hồi license của ${revokeDialog.userName}, trả về pool`);
    setRevokeDialog(null);
    setRevokeNote("");
  }

  function handleBulkAssign() {
    if (!bulkClass) return;
    const cls = CLASS_OPTIONS.find((c) => c.value === bulkClass);
    if (!cls) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.className.includes(bulkClass) && s.licenseStatus !== "assigned"
          ? { ...s, licenseStatus: "assigned", licenseKey: genKey() }
          : s,
      ),
    );
    toast.success(`Đã gán license cho ${cls.count} học sinh lớp ${bulkClass}`);
    setBulkClass("");
  }

  function handleBulkAssignSelected() {
    const ids = Array.from(selectedIds);
    if (activeTab === "teachers") {
      setTeachers((prev) => prev.map((t) => ids.includes(t.id) && t.licenseStatus !== "assigned" ? { ...t, licenseStatus: "assigned", licenseKey: genKey() } : t));
    } else {
      setStudents((prev) => prev.map((s) => ids.includes(s.id) && s.licenseStatus !== "assigned" ? { ...s, licenseStatus: "assigned", licenseKey: genKey() } : s));
    }
    toast.success(`Đã gán license cho ${ids.length} người được chọn`);
    setSelectedIds(new Set());
  }

  function handleBulkRevokeSelected() {
    const ids = Array.from(selectedIds);
    if (activeTab === "teachers") {
      setTeachers((prev) => prev.map((t) => ids.includes(t.id) ? { ...t, licenseStatus: "unassigned", licenseKey: null } : t));
    } else {
      setStudents((prev) => prev.map((s) => ids.includes(s.id) ? { ...s, licenseStatus: "unassigned", licenseKey: null } : s));
    }
    toast.success(`Đã thu hồi license của ${ids.length} người được chọn`);
    setSelectedIds(new Set());
  }

  const programs = ["all", "CT1", "CT2", "CT3", "CT4", "CT5"];

  return (
    <div className="space-y-5">
      {/* ── PageHeader ── */}
      <PageHeader
        icon={KeyRound}
        title="Gán / Thu hồi License"
        subtitle="Quản lý phân bổ license phần mềm STEM cho giáo viên và học sinh."
        accentColor="#990803"
        actions={
          <button
            onClick={() => toast.info("Xuất báo cáo phân bổ license theo lớp / GV ra Excel")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      {/* ── Pool Summary Banner ── */}
      <div className="bg-gradient-to-r from-[#2563eb]/5 to-[#c8a84e]/5 rounded-xl border border-border p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng license pool",        value: totalPool,    color: "#2563eb" },
          { label: "Đã sử dụng",               value: `${Math.round((usedPool / (totalPool || 1)) * 100)}%`, color: "#16a34a" },
          { label: "Còn trống",                value: freePool,     color: "#7c3aed" },
          { label: "Hết hạn trong 30 ngày",    value: expiringSoon, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p style={{ fontSize: "24px", fontWeight: 700, color, lineHeight: 1.2 }}>{value}</p>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={KeyRound}       label="Tổng license trong pool"  value={totalPool}    color="#2563eb" />
        <KpiCard icon={CheckCircle2}   label="Đã cấp phát"              value={usedPool}     color="#16a34a" />
        <KpiCard icon={Users}          label="Còn trống"                value={freePool}     color="#7c3aed" />
        <KpiCard icon={AlertTriangle}  label="Sắp hết hạn (30 ngày)"   value={expiringSoon} color="#f59e0b" />
      </div>

      {/* ── Low pool warning ── */}
      {totalPool > 0 && freePool / totalPool < 0.1 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 dark:text-red-300" style={{ fontSize: "13px", fontWeight: 700 }}>
              Cảnh báo: License pool sắp cạn ({freePool} / {totalPool} còn trống — {Math.round(freePool / totalPool * 100)}%)
            </p>
            <p className="text-red-600 dark:text-red-400 mt-0.5" style={{ fontSize: "12px" }}>
              Hãy liên hệ Geleximco hoặc mua thêm license để tránh gián đoạn việc gán cho học sinh và giáo viên.
            </p>
          </div>
        </div>
      )}

      {/* ── Bulk-by-class Section ── */}
      <div className="bg-secondary/30 rounded-lg p-3 border border-border flex flex-wrap items-center gap-3">
        <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
        <span style={{ fontSize: "13px", fontWeight: 600 }} className="text-foreground">
          Gán hàng loạt theo lớp:
        </span>
        <select
          value={bulkClass}
          onChange={(e) => setBulkClass(e.target.value)}
          className="px-3 py-1.5 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "12.5px", fontWeight: 500 }}
        >
          {CLASS_OPTIONS.map((cls) => (
            <option key={cls.value} value={cls.value}>
              {cls.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleBulkAssign}
          disabled={!bulkClass}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ fontSize: "12.5px", fontWeight: 600 }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Gán license cho lớp
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {(["teachers", "students"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch(""); setSelectedIds(new Set()); }}
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
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#990803]"
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
                  <th className="px-3 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={filteredTeachers().length > 0 && filteredTeachers().every((t) => selectedIds.has(t.id))}
                      onChange={() => toggleSelectAll(filteredTeachers().map((t) => t.id))}
                      className="w-4 h-4 cursor-pointer accent-[#990803]"
                    />
                  </th>
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
                  <tr key={t.id} className={cn("hover:bg-secondary/50 transition-colors", selectedIds.has(t.id) && "bg-[#2563eb]/5")}>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        className="w-4 h-4 cursor-pointer accent-[#990803]"
                      />
                    </td>
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
                          onClick={() => openAssignDialog(t.id, t.name, "teacher")}
                          className="p-1.5 rounded-lg bg-[#990803]/10 text-[#990803] hover:bg-[#990803]/20 transition-colors"
                          title="Gán license"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      {t.licenseStatus === "assigned" && (
                        <button
                          onClick={() => openRevokeDialog(t.id, t.name)}
                          className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                          title="Thu hồi license"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTeachers().length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
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
                  <th className="px-3 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={filteredStudents().length > 0 && filteredStudents().every((s) => selectedIds.has(s.id))}
                      onChange={() => toggleSelectAll(filteredStudents().map((s) => s.id))}
                      className="w-4 h-4 cursor-pointer accent-[#990803]"
                    />
                  </th>
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
                  <tr key={s.id} className={cn("hover:bg-secondary/50 transition-colors", selectedIds.has(s.id) && "bg-[#2563eb]/5")}>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(s.id)}
                        onChange={() => toggleSelect(s.id)}
                        className="w-4 h-4 cursor-pointer accent-[#990803]"
                      />
                    </td>
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
                          onClick={() => openAssignDialog(s.id, s.name, "student")}
                          className="p-1.5 rounded-lg bg-[#990803]/10 text-[#990803] hover:bg-[#990803]/20 transition-colors"
                          title="Gán license"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      {s.licenseStatus === "assigned" && (
                        <button
                          onClick={() => openRevokeDialog(s.id, s.name)}
                          className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                          title="Thu hồi license"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredStudents().length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                      Không tìm thấy học sinh phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Bulk Action Bar ── */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 flex items-center justify-between gap-4 bg-card border border-[#990803]/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#990803] flex items-center justify-center text-white" style={{ fontSize: "12px", fontWeight: 700 }}>
              {selectedIds.size}
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600 }}>người được chọn</span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkAssignSelected}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              <UserPlus className="w-4 h-4" />
              Gán license cho {selectedIds.size} người được chọn
            </button>
            <button
              onClick={handleBulkRevokeSelected}
              className="flex items-center gap-1.5 px-3 py-2 border border-orange-300 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <UserMinus className="w-4 h-4" /> Thu hồi
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* Assign License Dialog                                    */}
      {/* ════════════════════════════════════════════════════════ */}
      {assignDialog?.open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setAssignDialog(null); }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#990803]" />
                <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Gán License</h3>
              </div>
              <button
                onClick={() => setAssignDialog(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Person info */}
              <div className="p-3 bg-secondary/40 rounded-lg">
                <p style={{ fontSize: "13px", fontWeight: 600 }}>{assignDialog.userName}</p>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11.5px" }}>
                  {assignDialog.type === "teacher" ? "Giáo viên" : "Học sinh"}
                </p>
              </div>
              {/* Pool info */}
              <div className="flex items-center gap-2 p-2.5 bg-[#990803]/5 rounded-lg border border-[#990803]/20">
                <KeyRound className="w-4 h-4 text-[#990803] shrink-0" />
                <span style={{ fontSize: "12.5px" }}>
                  License pool còn trống: <strong>{freePool} license</strong>
                </span>
              </div>
              {/* Qty */}
              <div className="space-y-1.5">
                <label className="text-foreground" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                  Số lượng license gán <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={freePool}
                  value={assignQty}
                  onChange={(e) => setAssignQty(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:border-[#990803]"
                  style={{ fontSize: "13px" }}
                />
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                  Thông thường mỗi người dùng cần 1 license.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-secondary/20">
              <button
                onClick={() => setAssignDialog(null)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Huỷ
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={parseInt(assignQty) < 1 || parseInt(assignQty) > freePool}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <UserPlus className="w-4 h-4" /> Xác nhận Gán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* Revoke Reason Dialog                                     */}
      {/* ════════════════════════════════════════════════════════ */}
      {revokeDialog?.open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setRevokeDialog(null); }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-orange-500" />
                <h3 style={{ fontSize: "15px", fontWeight: 700 }} className="text-foreground">
                  Thu hồi License — {revokeDialog.userName}
                </h3>
              </div>
              <button
                onClick={() => setRevokeDialog(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Reason dropdown */}
              <div className="space-y-1.5">
                <label className="text-foreground" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                  Lý do thu hồi <span className="text-red-500">*</span>
                </label>
                <select
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:border-[#990803]"
                  style={{ fontSize: "13px" }}
                >
                  {REVOKE_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Notes textarea */}
              <div className="space-y-1.5">
                <label className="text-foreground" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                  Ghi chú
                </label>
                <textarea
                  value={revokeNote}
                  onChange={(e) => setRevokeNote(e.target.value)}
                  placeholder="Ghi chú thêm (không bắt buộc)..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:border-[#990803] resize-none"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-secondary/20">
              <button
                onClick={() => setRevokeDialog(null)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Huỷ
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ fontSize: "13px", fontWeight: 600, backgroundColor: "#990803" }}
              >
                Xác nhận Thu hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LicenseAssign;
