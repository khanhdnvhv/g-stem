import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import {
  ArrowLeft, School, Users, GraduationCap, BarChart3,
  CheckCircle2, AlertTriangle, XCircle, Package, Cpu, Wrench,
  TrendingUp, ClipboardCheck, Hash, Clock, Filter, RotateCcw, Search, Award,
  ChevronUp, ChevronDown, ChevronsUpDown,
} from "lucide-react";
import { PageHeader, KpiCard, SelectDown } from "./authority-ui";
import { tenantsByType, equipmentBySchool } from "./authority-data";
import { MOCK_RESULTS, gradeLabel, fmt } from "./authority-data";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

const ACCENT = "#7c3aed";

const STEM_PACKAGES = ["CT1", "CT2", "CT3", "CT4", "CT5"] as const;
const STEM_PKG_DESC: Record<string, string> = {
  CT1: "Tích hợp nội môn — thiết bị nền tảng: robot giáo dục, in 3D, kit điện tử cơ bản.",
  CT2: "Liên môn — bổ sung AI workstation, IoT sensor kit và phòng lab STEM.",
  CT3: "Đổi mới sáng tạo — máy cắt laser, drone, CLB sáng tạo và làm sản phẩm.",
  CT4: "Robotic · AI · Trải nghiệm — cánh tay robot, lập trình IoT, trải nghiệm thực tiễn.",
  CT5: "Nghiên cứu khoa học — VR/AR, lab khoa học tích hợp, nghiên cứu & báo cáo khoa học.",
};
const ACTIVE_PROGRAMS: Record<string, string[]> = {
  CT1: ["CT1"],
  CT2: ["CT1", "CT2"],
  CT3: ["CT1", "CT2", "CT3"],
  CT4: ["CT1", "CT2", "CT3", "CT4"],
  CT5: ["CT1", "CT2", "CT3", "CT4", "CT5"],
};

const EQ_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  ok:      { label: "Hoạt động", color: "#16a34a", bg: "#dcfce7" },
  warning: { label: "Cảnh báo",  color: "#d97706", bg: "#fef3c7" },
  broken:  { label: "Hỏng",      color: "#dc2626", bg: "#fee2e2" },
  missing: { label: "Thiếu",     color: "#6b7280", bg: "#f3f4f6" },
};

function TT38Badge({ pct }: { pct: number }) {
  if (pct >= 70)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
        style={{ background: "#dcfce7", color: "#16a34a" }}>
        <CheckCircle2 className="w-4 h-4" />Đạt chuẩn TT38
      </span>
    );
  if (pct >= 50)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
        style={{ background: "#fef3c7", color: "#d97706" }}>
        <AlertTriangle className="w-4 h-4" />Đạt một phần
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
      style={{ background: "#fee2e2", color: "#dc2626" }}>
      <XCircle className="w-4 h-4" />Chưa đạt chuẩn
    </span>
  );
}

type Tab = "overview" | "equipment" | "teachers" | "results";
type ResSortKey = "studentName" | "className" | "subject" | "examType" | "score" | "submittedAt";

function ResSortIcon({ col, sortKey, sortDir }: { col: ResSortKey; sortKey: ResSortKey; sortDir: "asc"|"desc" }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3 h-3 text-violet-600 inline ml-1" />
    : <ChevronDown className="w-3 h-3 text-violet-600 inline ml-1" />;
}

export function AuthoritySchoolDetail() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [eqStatus, setEqStatus]     = useState("all");
  const [eqCategory, setEqCategory] = useState("all");
  const [eqRoom, setEqRoom]         = useState("all");
  const [tvCert, setTvCert]         = useState("all");
  const [tvSubject, setTvSubject]   = useState("all");
  const [resSearch,   setResSearch]   = useState("");
  const [resKhoi,     setResKhoi]     = useState("all");
  const [resClass,    setResClass]    = useState("all");
  const [resSubject,  setResSubject]  = useState("all");
  const [resExamType, setResExamType] = useState("all");
  const [resSortKey,  setResSortKey]  = useState<"studentName"|"className"|"subject"|"examType"|"score"|"submittedAt">("submittedAt");
  const [resSortDir,  setResSortDir]  = useState<"asc"|"desc">("desc");

  const allSchools = tenantsByType.school;
  const tenant = allSchools.find((s) => s.id === schoolId);
  const idx = tenant ? allSchools.findIndex((s) => s.id === tenant.id) : -1;

  if (!tenant) {
    return (
      <div className="p-6 space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách trường
        </button>
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-3">
          <School className="w-12 h-12 opacity-30" />
          <p className="font-medium text-foreground">Trường chưa có trong hệ thống</p>
          <p className="text-sm">Trường này chưa được onboarding hoặc không thuộc phạm vi quản lý của bạn.</p>
        </div>
      </div>
    );
  }

  // Derive consistent stats from tenant index (same logic as SchoolDirectory)
  const eq = equipmentBySchool(tenant.id);
  const eqOk      = eq.filter((e) => e.status === "ok").length;
  const eqWarning = eq.filter((e) => e.status === "warning").length;
  const eqBroken  = eq.filter((e) => e.status === "broken").length;
  const eqMissing = eq.filter((e) => e.status === "missing").length;
  const eqOkPct = eq.length ? Math.round((eqOk / eq.length) * 100) : 0;
  const stemCoveragePct = 55 + (idx * 13) % 40;
  const avgScore = 6.5 + ((idx * 11) % 35) / 10;
  const studentsCount = 600 + (idx * 73) % 1800;
  const teachersCount = 40 + (idx * 7) % 80;
  const stemTeachersCount = 8 + (idx * 3) % 20;
  const stemPackage    = STEM_PACKAGES[idx % STEM_PACKAGES.length];
  const activePrograms = ACTIVE_PROGRAMS[stemPackage] ?? ["CT1"];
  const completionRate = 70 + (idx * 7) % 25;
  const lastSyncDaysAgo = (idx + 1) * 3;
  const lastSync = new Date(Date.now() - lastSyncDaysAgo * 86400_000).toLocaleDateString("vi-VN");

  // TT38 compliance: 4 criteria
  const tt38Csvc      = eqOkPct;
  const tt38Gv        = Math.round(stemTeachersCount / teachersCount * 100);
  const tt38ChuongTrinh = completionRate;
  const tt38BaoCao    = lastSyncDaysAgo <= 7 ? 100 : lastSyncDaysAgo <= 30 ? 75 : 40;
  const tt38Pct = Math.round((tt38Csvc + tt38Gv + tt38ChuongTrinh + tt38BaoCao) / 4);

  const MOCK_TEACHERS = [
    { name: "Nguyễn Văn An",     subject: "Toán",      programs: ["CT1", "CT2"], certs: ["Tập huấn CT1 cơ bản", "Tập huấn CT2 nâng cao"], trained: "2024-08" },
    { name: "Trần Thị Bình",     subject: "Vật lý",    programs: ["CT1", "CT4"], certs: ["Tập huấn CT1 cơ bản", "Chứng chỉ Robotic"],     trained: "2023-12" },
    { name: "Lê Hoàng Cường",    subject: "Tin học",   programs: ["CT4"],        certs: ["Chứng chỉ AI cơ bản", "Master Trainer"],         trained: "2024-03" },
    { name: "Phạm Thị Dung",     subject: "Hóa học",   programs: ["CT1", "CT2"], certs: ["Tập huấn CT1 cơ bản"],                           trained: "2025-01" },
    { name: "Vũ Minh Khoa",      subject: "Robotic",   programs: ["CT2", "CT3"], certs: ["Chứng chỉ Robotic", "Chứng chỉ IoT"],            trained: "2024-06" },
    { name: "Hoàng Thị Mai",     subject: "Ngữ văn",   programs: [],             certs: [],                                                trained: "" },
    { name: "Nguyễn Quang Vinh", subject: "Lịch sử",   programs: [],             certs: [],                                                trained: "" },
  ];
  const stemTeachersMock = MOCK_TEACHERS.filter((t) => t.programs.length > 0).length;
  const hasCertCount     = MOCK_TEACHERS.filter((t) => t.certs.length > 0).length;
  const noCertCount      = MOCK_TEACHERS.filter((t) => t.certs.length === 0).length;

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",  label: "Tổng quan" },
    { id: "equipment", label: `Thiết bị (${eq.length})` },
    { id: "teachers",  label: "Giáo viên" },
    { id: "results",   label: "Kết quả học tập" },
  ];

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate("/authority/schools")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách trường
        </button>
        <PageHeader
          icon={School}
          title={tenant.name}
          subtitle={`${tenant.gradeLevels?.[0] ?? "—"} · ${tenant.district}, ${tenant.province} · Mã: ${tenant.code}`}
          accentColor={ACCENT}
          actions={<TT38Badge pct={tt38Pct} />}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users}         label="Học sinh"       value={studentsCount.toLocaleString()} color={ACCENT} />
        <KpiCard icon={GraduationCap} label="GV dạy STEM"    value={stemTeachersCount} color="#2563eb" subtitle={`/ ${teachersCount} GV`} />
        <KpiCard icon={BarChart3}     label="Thiết bị OK"    value={`${eqOkPct}%`} color={eqOkPct >= 70 ? "#16a34a" : "#d97706"} />
        <KpiCard icon={TrendingUp}    label="Bao phủ STEM"   value={`${stemCoveragePct}%`} color="#0891b2" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={tab === t.id
              ? { background: "#fff", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
              : { color: "var(--muted-foreground)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chương trình STEM */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5" style={{ color: ACCENT }} />
              <h3 className="font-semibold text-sm">Chương trình STEM đang triển khai</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {activePrograms.map((p) => (
                <span key={p} className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: ACCENT }}>{p}</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {STEM_PKG_DESC[stemPackage]}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span><Hash className="w-3 h-3 inline mr-0.5" />Năm học 2025–2026</span>
              <span><Clock className="w-3 h-3 inline mr-0.5" />Đồng bộ {lastSync}</span>
            </div>
          </div>

          {/* Kết quả học tập */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" style={{ color: "#2563eb" }} />
              <h3 className="font-semibold text-sm">Kết quả học tập tổng quan</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Tỉ lệ hoàn thành chương trình</span>
                  <span className="font-semibold">{completionRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${completionRate}%`, background: "#2563eb" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Điểm trung bình STEM</span>
                  <span className="font-semibold">{avgScore.toFixed(1)}/10</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${avgScore * 10}%`, background: "#16a34a" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Tỉ lệ GV được cấp chứng chỉ</span>
                  <span className="font-semibold">{Math.round(stemTeachersCount / teachersCount * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{ width: `${stemTeachersCount / teachersCount * 100}%`, background: ACCENT }} />
                </div>
              </div>
            </div>
          </div>

          {/* Thiết bị */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5" style={{ color: "#7c3aed" }} />
              <h3 className="font-semibold text-sm">Tình trạng Thiết bị ({eq.length} thiết bị)</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: "Hoạt động", count: eqOk,      ...EQ_STATUS.ok },
                { label: "Cảnh báo",  count: eqWarning,  ...EQ_STATUS.warning },
                { label: "Hỏng",      count: eqBroken,   ...EQ_STATUS.broken },
                { label: "Thiếu",     count: eqMissing,  ...EQ_STATUS.missing },
              ].map((r) => (
                <div key={r.label} className="rounded-lg p-2 text-center" style={{ background: r.bg }}>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: r.color }}>{r.count}</p>
                  <p style={{ fontSize: "10px", color: r.color, fontWeight: 600 }}>{r.label}</p>
                </div>
              ))}
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full"
                style={{ width: `${eqOkPct}%`, background: eqOkPct >= 70 ? "#16a34a" : eqOkPct >= 50 ? "#d97706" : "#dc2626" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{eqOkPct}% thiết bị hoạt động bình thường</p>
          </div>

          {/* Tuân thủ TT38 — 4 tiêu chí */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" style={{ color: "#16a34a" }} />
                <h3 className="font-semibold text-sm">Tuân thủ Thông tư 38</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold"
                  style={{ color: tt38Pct >= 70 ? "#16a34a" : tt38Pct >= 50 ? "#d97706" : "#dc2626" }}>
                  {tt38Pct}%
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "CSVC — Thiết bị đạt chuẩn", pct: tt38Csvc },
                { label: "Giáo viên được đào tạo",     pct: tt38Gv },
                { label: "Chương trình triển khai",    pct: tt38ChuongTrinh },
                { label: "Báo cáo & đồng bộ dữ liệu", pct: tt38BaoCao },
              ].map(({ label, pct }) => {
                const color = pct >= 70 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Ngưỡng yêu cầu mỗi tiêu chí</span>
              <span className="font-semibold">≥ 70%</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Equipment */}
      {tab === "equipment" && (() => {
        const categories = ["all", ...Array.from(new Set(eq.map(e => e.category)))];
        const rooms      = ["all", ...Array.from(new Set(eq.map(e => e.location)))];
        const catOptions = categories.map(c => ({ value: c, label: c === "all" ? "Tất cả" : c }));
        const roomOptions = rooms.map(r => ({ value: r, label: r === "all" ? "Tất cả" : r }));
        const EQ_STATUS_CHIPS = [
          { value: "all",     label: "Tất cả" },
          { value: "ok",      label: "Hoạt động" },
          { value: "warning", label: "Cảnh báo" },
          { value: "broken",  label: "Hỏng" },
          { value: "missing", label: "Thiếu" },
        ];
        const filtered = eq.filter(e =>
          (eqStatus   === "all" || e.status   === eqStatus) &&
          (eqCategory === "all" || e.category === eqCategory) &&
          (eqRoom     === "all" || e.location === eqRoom)
        );
        const hasFilter = eqStatus !== "all" || eqCategory !== "all" || eqRoom !== "all";
        return (
          <div className="space-y-3">
            {/* Filter bar */}
            <div className="bg-card rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium text-muted-foreground shrink-0">Bộ lọc</span>
                <SelectDown
                  label="Danh mục"
                  value={eqCategory}
                  onChange={setEqCategory}
                  options={catOptions}
                />
                <SelectDown
                  label="Phòng"
                  value={eqRoom}
                  onChange={setEqRoom}
                  options={roomOptions}
                />
                <div className="w-px h-5 bg-border mx-1 shrink-0" />
                {EQ_STATUS_CHIPS.map(chip => {
                  const st = chip.value !== "all" ? EQ_STATUS[chip.value] : null;
                  const active = eqStatus === chip.value;
                  return (
                    <button
                      key={chip.value}
                      onClick={() => setEqStatus(chip.value)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                      style={active
                        ? { background: st?.bg ?? ACCENT, color: st?.color ?? "#fff", borderColor: st?.color ?? ACCENT }
                        : { background: "transparent", color: "var(--muted-foreground)", borderColor: "var(--border)" }
                      }
                    >
                      {chip.label}
                    </button>
                  );
                })}
                {hasFilter && (
                  <button
                    onClick={() => { setEqStatus("all"); setEqCategory("all"); setEqRoom("all"); }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
                  >
                    <RotateCcw className="w-3 h-3" />Đặt lại
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" style={{ color: ACCENT }} />
                  <span className="font-semibold text-sm">Danh sách thiết bị — {tenant.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{filtered.length} / {eq.length} thiết bị</span>
              </div>
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">Không có thiết bị phù hợp với bộ lọc.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Thiết bị</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Danh mục</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Phòng</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Trạng thái</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs">Kiểm tra gần nhất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((e) => {
                      const st = EQ_STATUS[e.status] ?? EQ_STATUS.ok;
                      return (
                        <tr key={e.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <p className="font-medium">{e.name}</p>
                            <p className="font-mono text-muted-foreground text-xs">{e.serial}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{e.category}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{e.location}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ color: st.color, background: st.bg }}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                            {new Date(e.lastCheckedAt).toLocaleDateString("vi-VN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })()}

      {/* Tab: Teachers */}
      {tab === "teachers" && (() => {
        const formatTrained = (s: string) => {
          if (!s) return "—";
          const [y, m] = s.split("-");
          return `Tháng ${parseInt(m)}/${y}`;
        };
        const uniqueSubjects = ["all", ...Array.from(new Set(MOCK_TEACHERS.map(t => t.subject)))];
        const subjectOptions = uniqueSubjects.map(s => ({ value: s, label: s === "all" ? "Tất cả" : s }));
        const CERT_CHIPS = [
          { value: "all",  label: "Tất cả",      activeColor: ACCENT,    activeBg: "#ede9fe" },
          { value: "stem", label: "Dạy STEM",     activeColor: "#2563eb", activeBg: "#dbeafe" },
          { value: "has",  label: "Có chứng chỉ", activeColor: "#16a34a", activeBg: "#dcfce7" },
          { value: "none", label: "Chưa có CC",   activeColor: "#d97706", activeBg: "#fef3c7" },
        ];
        const filtered = MOCK_TEACHERS.filter(t =>
          (tvSubject === "all" || t.subject === tvSubject) &&
          (tvCert === "all"  ||
           (tvCert === "stem" && t.programs.length > 0) ||
           (tvCert === "has"  && t.certs.length > 0) ||
           (tvCert === "none" && t.certs.length === 0))
        );
        const hasFilter = tvCert !== "all" || tvSubject !== "all";

        return (
          <div className="space-y-3">
            {/* KPI — dùng số liệu thực từ trường */}
            {(() => {
              const certifiedCount = Math.round(hasCertCount / stemTeachersMock * stemTeachersCount);
              const noCertRealCount = stemTeachersCount - certifiedCount;
              return (
                <div className="grid grid-cols-4 gap-3">
                  <KpiCard icon={Users}         label="Tổng GV"          value={teachersCount}    color="#6b7280" subtitle={`/ ${teachersCount} GV toàn trường`} />
                  <KpiCard icon={GraduationCap} label="Phụ trách STEM"   value={stemTeachersCount} color={ACCENT} subtitle={`/ ${teachersCount} GV`} />
                  <KpiCard icon={CheckCircle2}  label="Có chứng chỉ"     value={certifiedCount}   color="#16a34a" subtitle={`/ ${stemTeachersCount} GV STEM`} />
                  <KpiCard icon={AlertTriangle} label="Chưa có CC"        value={noCertRealCount}  color="#d97706" subtitle={`/ ${stemTeachersCount} GV STEM`} />
                </div>
              );
            })()}

            {/* Filter bar */}
            <div className="bg-card rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium text-muted-foreground shrink-0">Bộ lọc</span>
                <SelectDown
                  label="Bộ môn"
                  value={tvSubject}
                  onChange={setTvSubject}
                  options={subjectOptions}
                />
                <div className="w-px h-5 bg-border mx-1 shrink-0" />
                {CERT_CHIPS.map(chip => {
                  const active = tvCert === chip.value;
                  return (
                    <button
                      key={chip.value}
                      onClick={() => setTvCert(chip.value)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                      style={active
                        ? { background: chip.activeBg, color: chip.activeColor, borderColor: chip.activeColor }
                        : { background: "transparent", color: "var(--muted-foreground)", borderColor: "var(--border)" }
                      }
                    >
                      {chip.label}
                    </button>
                  );
                })}
                {hasFilter && (
                  <button
                    onClick={() => { setTvCert("all"); setTvSubject("all"); }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
                  >
                    <RotateCcw className="w-3 h-3" />Đặt lại
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" style={{ color: ACCENT }} />
                  <span className="font-semibold text-sm">Danh sách giáo viên</span>
                </div>
                <span className="text-xs text-muted-foreground">{filtered.length} / {MOCK_TEACHERS.length} giáo viên</span>
              </div>
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">Không có giáo viên phù hợp với bộ lọc.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Giáo viên</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Bộ môn</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Phụ trách CT</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Chứng chỉ STEM</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs">Tập huấn gần nhất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((t, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{t.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{t.subject}</td>
                        <td className="px-4 py-3">
                          {t.programs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {t.programs.map(p => (
                                <span key={p} className="px-1.5 py-0.5 rounded text-xs font-medium"
                                  style={{ background: "#ede9fe", color: ACCENT }}>{p}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {t.programs.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : t.certs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {t.certs.map(c => (
                                <span key={c} className="px-2 py-0.5 rounded-full text-xs font-medium"
                                  style={{ background: "#dcfce7", color: "#16a34a" }}>{c}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: "#fef3c7", color: "#d97706" }}>Chưa có</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatTrained(t.trained)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })()}

      {/* Tab: Results */}
      {tab === "results" && (() => {
        const khois   = Array.from(new Set(MOCK_RESULTS.map(r => r.className.replace(/[A-Za-z].*/, "")))).sort();
        const classes = Array.from(new Set(MOCK_RESULTS.filter(r => resKhoi === "all" || r.className.startsWith(resKhoi)).map(r => r.className))).sort();
        const subjects= Array.from(new Set(MOCK_RESULTS.map(r => r.subject))).sort();
        const examTypes = Array.from(new Set(MOCK_RESULTS.map(r => r.examType))).sort();

        const filtered = MOCK_RESULTS.filter(r => {
          if (resKhoi     !== "all" && !r.className.startsWith(resKhoi)) return false;
          if (resClass    !== "all" && r.className !== resClass)          return false;
          if (resSubject  !== "all" && r.subject   !== resSubject)        return false;
          if (resExamType !== "all" && r.examType  !== resExamType)       return false;
          if (resSearch && !r.studentName.toLowerCase().includes(resSearch.toLowerCase())) return false;
          return true;
        });

        const toggleSort = (col: ResSortKey) => {
          if (resSortKey === col) setResSortDir(d => d === "asc" ? "desc" : "asc");
          else { setResSortKey(col); setResSortDir("asc"); }
        };
        const sorted = [...filtered].sort((a, b) => {
          const aVal = a[resSortKey], bVal = b[resSortKey];
          const cmp = typeof aVal === "number" && typeof bVal === "number"
            ? aVal - bVal
            : String(aVal).localeCompare(String(bVal), "vi");
          return resSortDir === "asc" ? cmp : -cmp;
        });

        const avg      = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.score, 0) / filtered.length * 10) / 10 : 0;
        const passRate = filtered.length ? Math.round(filtered.filter(r => r.score >= 5).length / filtered.length * 100) : 0;
        const maxScore = filtered.length ? Math.max(...filtered.map(r => r.score)) : 0;

        const distData = [
          { label: "< 5 (Yếu)",   color: "#e11d48", count: filtered.filter(r => r.score < 5).length },
          { label: "5–6.9 (TB)",  color: "#f59e0b", count: filtered.filter(r => r.score >= 5 && r.score < 7).length },
          { label: "7–8.4 (Khá)", color: "#0891b2", count: filtered.filter(r => r.score >= 7 && r.score < 8.5).length },
          { label: "≥8.5 (Giỏi)", color: "#16a34a", count: filtered.filter(r => r.score >= 8.5).length },
        ];

        const classData = (() => {
          const map = new Map<string, number[]>();
          filtered.forEach(r => { if (!map.has(r.className)) map.set(r.className, []); map.get(r.className)!.push(r.score); });
          return Array.from(map.entries()).map(([cls, scores]) => ({ className: cls, avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10, count: scores.length })).sort((a, b) => b.avg - a.avg);
        })();

        const hasFilter = resKhoi !== "all" || resClass !== "all" || resSubject !== "all" || resExamType !== "all" || resSearch !== "";
        const selectCls = "px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground outline-none hover:border-violet-400 transition-colors text-xs";

        return (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input value={resSearch} onChange={e => setResSearch(e.target.value)} placeholder="Tìm học sinh..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-card outline-none text-xs" style={{ width: "140px" }} />
              </div>
              <select value={resKhoi} onChange={e => { setResKhoi(e.target.value); setResClass("all"); }} className={selectCls}>
                <option value="all">Tất cả khối</option>
                {khois.map(k => <option key={k} value={k}>Khối {k}</option>)}
              </select>
              <select value={resClass} onChange={e => setResClass(e.target.value)} className={selectCls}>
                <option value="all">Tất cả lớp</option>
                {classes.map(c => <option key={c} value={c}>Lớp {c}</option>)}
              </select>
              <select value={resSubject} onChange={e => setResSubject(e.target.value)} className={selectCls}>
                <option value="all">Tất cả môn</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={resExamType} onChange={e => setResExamType(e.target.value)} className={selectCls}>
                <option value="all">Tất cả loại đề</option>
                {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {hasFilter && (
                <button onClick={() => { setResKhoi("all"); setResClass("all"); setResSubject("all"); setResExamType("all"); setResSearch(""); }}
                  className="px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-xs transition-colors">
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard icon={Users}        label="HS đã thi"        value={filtered.length}       color={ACCENT} />
              <KpiCard icon={TrendingUp}   label="Điểm trung bình"  value={avg.toFixed(1)}         color="#0891b2" />
              <KpiCard icon={CheckCircle2} label="Tỉ lệ đạt (≥5)"  value={`${passRate}%`}         color="#16a34a" />
              <KpiCard icon={Award}        label="Điểm cao nhất"    value={maxScore.toFixed(1)}    color="#f59e0b" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="font-semibold text-sm mb-4">Phân phối điểm</p>
                {filtered.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 text-xs">Không có dữ liệu</p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={distData} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v} HS`, "Số học sinh"]} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {distData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="font-semibold text-sm mb-4">So sánh điểm TB theo lớp</p>
                {classData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 text-xs">Không có dữ liệu</p>
                ) : (
                  <div className="space-y-2.5">
                    {classData.map(c => {
                      const g = gradeLabel(c.avg);
                      return (
                        <div key={c.className}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Lớp {c.className} <span className="text-muted-foreground">({c.count} HS)</span></span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs" style={{ color: g.color }}>{c.avg}</span>
                              <span className="px-1.5 py-0.5 rounded text-white font-semibold text-[10px]" style={{ backgroundColor: g.color }}>{g.label}</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${c.avg * 10}%`, backgroundColor: g.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Detail table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-secondary/30">
                <span className="font-semibold text-sm">Chi tiết kết quả</span>
                <span className="text-muted-foreground text-xs ml-2">{filtered.length} học sinh</span>
              </div>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <XCircle className="w-8 h-8 text-muted-foreground opacity-40" />
                  <p className="text-muted-foreground text-sm">Không tìm thấy kết quả phù hợp</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50">
                        <th className="px-3 py-2.5 text-left text-muted-foreground font-semibold text-xs whitespace-nowrap">STT</th>
                        {([ ["studentName","Học sinh"], ["className","Lớp"], ["subject","Môn"], ["examType","Loại đề"] ] as [ResSortKey, string][]).map(([col, label]) => (
                          <th key={col} className="px-3 py-2.5 text-left text-muted-foreground font-semibold text-xs whitespace-nowrap cursor-pointer hover:text-foreground select-none"
                            onClick={() => toggleSort(col)}>
                            {label}<ResSortIcon col={col} sortKey={resSortKey} sortDir={resSortDir} />
                          </th>
                        ))}
                        <th className="px-3 py-2.5 text-left text-muted-foreground font-semibold text-xs whitespace-nowrap">Chương</th>
                        <th className="px-3 py-2.5 text-left text-muted-foreground font-semibold text-xs whitespace-nowrap">Bộ đề</th>
                        <th className="px-3 py-2.5 text-left text-muted-foreground font-semibold text-xs whitespace-nowrap cursor-pointer hover:text-foreground select-none"
                          onClick={() => toggleSort("score")}>
                          Điểm<ResSortIcon col="score" sortKey={resSortKey} sortDir={resSortDir} />
                        </th>
                        <th className="px-3 py-2.5 text-left text-muted-foreground font-semibold text-xs whitespace-nowrap">Đúng/Tổng</th>
                        <th className="px-3 py-2.5 text-left text-muted-foreground font-semibold text-xs whitespace-nowrap">Xếp loại</th>
                        <th className="px-3 py-2.5 text-left text-muted-foreground font-semibold text-xs whitespace-nowrap cursor-pointer hover:text-foreground select-none"
                          onClick={() => toggleSort("submittedAt")}>
                          Nộp lúc<ResSortIcon col="submittedAt" sortKey={resSortKey} sortDir={resSortDir} />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sorted.map((r, i) => {
                        const g = gradeLabel(r.score);
                        return (
                          <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="px-3 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                            <td className="px-3 py-2.5 font-medium whitespace-nowrap text-xs">{r.studentName}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-xs">{r.className}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-xs">{r.subject}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[11px]">{r.examType}</span>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground text-xs">{r.chapterName || "—"}</td>
                            <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap text-xs">{r.setLabel}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="font-bold text-sm" style={{ color: g.color }}>{r.score.toFixed(1)}</span>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap text-xs">{r.correctCount}/{r.totalCount}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full font-semibold text-white text-[10px]" style={{ backgroundColor: g.color }}>{g.label}</span>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap text-xs">{fmt(r.submittedAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
