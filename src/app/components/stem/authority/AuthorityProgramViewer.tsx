import { useState } from "react";
import { BookOpen, Download, Users, School, ChevronDown, ChevronRight, CheckCircle2, ShieldCheck, AlertTriangle, XCircle, Clock } from "lucide-react";
import { STEM_PROGRAMS } from "./authority-data";
import type { StemProgram } from "./authority-data";
import { useAuth } from "./authority-ui";
import { PageHeader, KpiCard } from "./authority-ui";
import { toast } from "sonner";

/* ================================================================ */
/*  AUTHORITY PROGRAM VIEWER — Xem Chương trình CT1–CT5 toàn tỉnh   */
/* ================================================================ */

const ACCENT = "#7c3aed";

interface SchoolProgram {
  schoolId:   string;
  schoolName: string;
  district:   string;
  tier:       string;
  programs:   StemProgram[];
  teachers:   number;
  students:   number;
  startDate:  string;
}

const SCHOOL_PROGRAMS: SchoolProgram[] = [
  { schoolId:"S01", schoolName:"THCS Cầu Giấy",              district:"Cầu Giấy",     tier:"THCS",      programs:["CT1","CT2","CT4"], teachers:28, students:452, startDate:"2024-09-01" },
  { schoolId:"S02", schoolName:"THPT Chu Văn An",             district:"Tây Hồ",      tier:"THPT",      programs:["CT1","CT2","CT3","CT4","CT5"], teachers:42, students:501, startDate:"2024-08-15" },
  { schoolId:"S03", schoolName:"Tiểu học Đống Đa",            district:"Đống Đa",     tier:"Tiểu học",  programs:["CT1","CT3"], teachers:35, students:415, startDate:"2024-09-05" },
  { schoolId:"S04", schoolName:"THCS Hai Bà Trưng",           district:"Hai Bà Trưng",tier:"THCS",      programs:["CT1","CT2"], teachers:31, students:357, startDate:"2024-09-10" },
  { schoolId:"S05", schoolName:"THPT Lý Thường Kiệt",         district:"Hoàn Kiếm",   tier:"THPT",      programs:["CT1","CT2","CT4","CT5"], teachers:38, students:392, startDate:"2024-08-20" },
  { schoolId:"S06", schoolName:"Tiểu học Kim Liên",           district:"Đống Đa",     tier:"Tiểu học",  programs:["CT1"], teachers:29, students:291, startDate:"2024-09-12" },
  { schoolId:"S07", schoolName:"THCS Thanh Xuân",             district:"Thanh Xuân",  tier:"THCS",      programs:["CT1","CT2","CT3"], teachers:30, students:358, startDate:"2024-09-10" },
  { schoolId:"S08", schoolName:"THPT Nguyễn Huệ",             district:"Hà Đông",     tier:"THPT",      programs:["CT1","CT2","CT4"], teachers:44, students:576, startDate:"2024-08-20" },
  { schoolId:"S09", schoolName:"Tiểu học Mê Linh A",          district:"Mê Linh",     tier:"Tiểu học",  programs:["CT1"], teachers:22, students:188, startDate:"2024-10-15" },
  { schoolId:"S10", schoolName:"THCS Sóc Sơn",                district:"Sóc Sơn",     tier:"THCS",      programs:["CT1"], teachers:24, students:231, startDate:"2024-10-20" },
  { schoolId:"S11", schoolName:"Tiểu học Phúc Thọ B",         district:"Phúc Thọ",    tier:"Tiểu học",  programs:["CT1"], teachers:18, students:62,  startDate:"2024-11-01" },
  { schoolId:"S12", schoolName:"THPT Nghề Đông Anh",          district:"Đông Anh",    tier:"THPT Nghề", programs:["CT1","CT4"], teachers:26, students:264, startDate:"2024-11-01" },
  { schoolId:"S13", schoolName:"Mầm non Hoa Mai",             district:"Ba Đình",     tier:"Mầm non",   programs:["CT1"], teachers:15, students:95,  startDate:"2024-09-15" },
  { schoolId:"S14", schoolName:"THCS Ba Vì",                  district:"Ba Vì",       tier:"THCS",      programs:["CT1","CT2"], teachers:28, students:284, startDate:"2024-08-01" },
  { schoolId:"S15", schoolName:"Tiểu học Thường Tín C",       district:"Thường Tín",  tier:"Tiểu học",  programs:["CT1"], teachers:12, students:33,  startDate:"2024-11-20" },
];

const CT_SUBJECTS: Record<StemProgram, string[]> = {
  CT1: ["Toán STEM", "Lý STEM", "Hóa STEM", "Sinh STEM", "Khoa học TN STEM", "Tin học STEM"],
  CT2: ["Toán STEM", "Lý STEM", "Hóa STEM", "Sinh STEM", "Công nghệ STEM"],
  CT3: ["CLB Sáng tạo", "Ngoại khóa STEM", "Làm sản phẩm"],
  CT4: ["Robotic", "AI & Lập trình", "IoT"],
  CT5: ["NCKH", "Dự án Nghiên cứu"],
};

const CT_ORDER: StemProgram[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];

type TopicStatus = "approved" | "pending" | "missing";

interface CurriculumTopic {
  id:      string;
  subject: string;
  topic:   string;
  grade:   string;
  sgkRef:  string;       // Tham chiếu Sách giáo khoa
  status:  TopicStatus;
  submittedBy?: string;
}

const CONTENT_COVERAGE: Record<StemProgram, CurriculumTopic[]> = {
  CT1: [
    { id:"T1-01", subject:"Toán STEM",      topic:"Phương trình bậc 2 trong thực tiễn",   grade:"THCS 9",    sgkRef:"Toán 9 — Chương 4, Bài 3",      status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T1-02", subject:"Toán STEM",      topic:"Hàm số bậc nhất — Ứng dụng kỹ thuật", grade:"THCS 8",    sgkRef:"Toán 8 — Chương 2, Bài 5",      status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T1-03", subject:"Lý STEM",        topic:"Điện trở và định luật Ohm thực tế",    grade:"THCS 9",    sgkRef:"Vật lý 9 — Chương 1, Bài 2",    status:"approved",  submittedBy:"NXB Giáo dục" },
    { id:"T1-04", subject:"Lý STEM",        topic:"Lực và chuyển động — Mô hình xe STEM", grade:"THCS 8",    sgkRef:"Vật lý 8 — Chương 2, Bài 4",    status:"pending",   submittedBy:"Geleximco STEM" },
    { id:"T1-05", subject:"Hóa STEM",       topic:"Phản ứng Axit-Bazơ — Thí nghiệm lab", grade:"THCS 8",    sgkRef:"Hóa học 8 — Chương 3, Bài 7",   status:"approved",  submittedBy:"NXB Giáo dục" },
    { id:"T1-06", subject:"Hóa STEM",       topic:"Tốc độ phản ứng hóa học",             grade:"THPT 10",   sgkRef:"Hóa học 10 — Chương 6, Bài 1",  status:"pending",   submittedBy:"ĐH Sư phạm HN" },
    { id:"T1-07", subject:"Sinh STEM",      topic:"Hệ sinh thái và chuỗi thức ăn",       grade:"THCS 7",    sgkRef:"Sinh học 7 — Chương 5, Bài 12", status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T1-08", subject:"Sinh STEM",      topic:"Di truyền và biến dị — Ứng dụng",     grade:"THCS 9",    sgkRef:"Sinh học 9 — Chương 2, Bài 8",  status:"missing" },
    { id:"T1-09", subject:"Tin học STEM",   topic:"Lập trình Scratch — Tư duy thuật toán",grade:"Tiểu học 5",sgkRef:"Tin học 5 — Chương 1, Bài 1",  status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T1-10", subject:"Tin học STEM",   topic:"Python cơ bản — Vòng lặp, hàm số",   grade:"THCS 8",    sgkRef:"Tin học 8 — Chương 3, Bài 2",   status:"missing" },
  ],
  CT2: [
    { id:"T2-01", subject:"Toán-Lý STEM",   topic:"Cầu treo — Toán học và lực học",       grade:"THPT 10",  sgkRef:"Toán 10 + Vật lý 10",           status:"approved",  submittedBy:"ĐH Sư phạm HN" },
    { id:"T2-02", subject:"Toán-Lý STEM",   topic:"Dao động cơ — Mô hình con lắc",        grade:"THPT 11",  sgkRef:"Vật lý 11 — Chương 3",          status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T2-03", subject:"Toán-Hóa STEM",  topic:"Nồng độ dung dịch — Bài toán pha chế", grade:"THPT 10", sgkRef:"Hóa 10 + Toán 10",              status:"pending",   submittedBy:"NXB Giáo dục" },
    { id:"T2-04", subject:"Lý-Hóa STEM",    topic:"Điện phân — Ứng dụng sản xuất",        grade:"THPT 11",  sgkRef:"Hóa 11 + Vật lý 11",           status:"missing" },
    { id:"T2-05", subject:"Công nghệ STEM", topic:"Thiết kế kỹ thuật — Bản vẽ 3D",        grade:"THPT 10",  sgkRef:"Công nghệ 10 — Chương 2",       status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T2-06", subject:"Công nghệ STEM", topic:"Vật liệu kỹ thuật và ứng dụng",        grade:"THPT 11",  sgkRef:"Công nghệ 11 — Chương 1",       status:"missing" },
  ],
  CT3: [
    { id:"T3-01", subject:"CLB Sáng tạo",   topic:"Thiết kế sản phẩm từ vật liệu tái chế",grade:"THCS",    sgkRef:"Ngoại khóa — Chủ đề môi trường",status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T3-02", subject:"CLB Sáng tạo",   topic:"Làm mô hình kiến trúc thu nhỏ",        grade:"THCS",    sgkRef:"Ngoại khóa — Chủ đề xây dựng", status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T3-03", subject:"Ngoại khóa STEM",topic:"Tham quan nhà máy — Công nghiệp 4.0",  grade:"THPT",    sgkRef:"Hoạt động trải nghiệm",         status:"pending",   submittedBy:"Geleximco STEM" },
    { id:"T3-04", subject:"Làm sản phẩm",   topic:"Lắp ráp xe thế năng — Thi đấu",       grade:"Tiểu học",sgkRef:"Hoạt động STEM TH",             status:"missing" },
  ],
  CT4: [
    { id:"T4-01", subject:"Robotic",         topic:"Lập trình robot LEGO Mindstorms",      grade:"THCS 7",   sgkRef:"CT4 — Module Robotic cơ bản",   status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T4-02", subject:"Robotic",         topic:"Cảm biến và điều khiển tự động",       grade:"THCS 8",   sgkRef:"CT4 — Module Robotic nâng cao", status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T4-03", subject:"AI & Lập trình",  topic:"Machine Learning cơ bản — Python",     grade:"THPT 11",  sgkRef:"CT4 — Module AI",               status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T4-04", subject:"AI & Lập trình",  topic:"Nhận diện hình ảnh với TensorFlow",    grade:"THPT 12",  sgkRef:"CT4 — Module AI nâng cao",      status:"pending",   submittedBy:"Geleximco STEM" },
    { id:"T4-05", subject:"IoT",             topic:"Arduino và cảm biến môi trường",       grade:"THPT 10",  sgkRef:"CT4 — Module IoT",              status:"approved",  submittedBy:"Geleximco STEM" },
    { id:"T4-06", subject:"IoT",             topic:"Kết nối thiết bị qua MQTT/Cloud",      grade:"THPT 11",  sgkRef:"CT4 — Module IoT nâng cao",     status:"missing" },
  ],
  CT5: [
    { id:"T5-01", subject:"NCKH",            topic:"Phương pháp nghiên cứu khoa học",      grade:"THPT 10",  sgkRef:"CT5 — Module NCKH cơ bản",      status:"approved",  submittedBy:"ĐH Sư phạm HN" },
    { id:"T5-02", subject:"NCKH",            topic:"Thiết kế thí nghiệm và thu thập số liệu",grade:"THPT 11",sgkRef:"CT5 — Module NCKH nâng cao",   status:"approved",  submittedBy:"ĐH Sư phạm HN" },
    { id:"T5-03", subject:"Dự án NC",        topic:"Báo cáo khoa học — Trình bày kết quả", grade:"THPT 12",  sgkRef:"CT5 — Module Dự án",            status:"pending",   submittedBy:"Geleximco STEM" },
    { id:"T5-04", subject:"Dự án NC",        topic:"Nghiên cứu vật liệu tái chế ứng dụng", grade:"THPT 11", sgkRef:"CT5 — Module Dự án",            status:"missing" },
  ],
};

export function AuthorityProgramViewer() {
  const { user } = useAuth();
  const myProvince = user?.province || "Hà Nội";
  const [mainTab, setMainTab] = useState<"deploy" | "review">("deploy");
  const [selectedCt, setSelectedCt] = useState<StemProgram | "all">("all");
  const [expanded, setExpanded] = useState<StemProgram | null>(null);
  const [reviewCt, setReviewCt] = useState<StemProgram>("CT1");

  const ctStats = CT_ORDER.map((ct) => {
    const schools = SCHOOL_PROGRAMS.filter((s) => s.programs.includes(ct));
    return {
      ct,
      schools: schools.length,
      teachers: schools.reduce((s, x) => s + x.teachers, 0),
      students: schools.reduce((s, x) => s + x.students, 0),
      meta: STEM_PROGRAMS[ct],
    };
  });

  const totalSchools = new Set(SCHOOL_PROGRAMS.flatMap((s) => s.schoolId)).size;
  const allCtSchools = SCHOOL_PROGRAMS.filter((s) => s.programs.length === 5).length;

  const filteredSchools = selectedCt === "all"
    ? SCHOOL_PROGRAMS
    : SCHOOL_PROGRAMS.filter((s) => s.programs.includes(selectedCt));

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BookOpen}
        title={`Chương trình STEM CT1–CT5 — ${myProvince}`}
        subtitle="Giám sát triển khai 5 chương trình STEM chuẩn Bộ GD&ĐT tại các trường trong tỉnh"
        accentColor={ACCENT}
        actions={
          <button
            onClick={() => toast.info("Xuất báo cáo triển khai chương trình")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:opacity-90"
            style={{ background: ACCENT, fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      {/* Main tab switcher */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {([
          { id: "deploy", label: "Triển khai tại trường" },
          { id: "review", label: "Thẩm định Nội dung" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={mainTab === t.id
              ? { background: "#fff", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
              : { color: "var(--muted-foreground)" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mainTab === "deploy" && <>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={School}    label="Trường đang triển khai" value={totalSchools}   color={ACCENT}   subtitle="ít nhất 1 chương trình" />
        <KpiCard icon={BookOpen}  label="Trường đủ 5 chương trình" value={allCtSchools} color="#16a34a"  subtitle="CT1 đến CT5" />
        <KpiCard icon={Users}     label="Giáo viên STEM"           value={SCHOOL_PROGRAMS.reduce((s,x)=>s+x.teachers,0)} color="#2563eb" />
        <KpiCard icon={Users}     label="Học sinh tham gia"        value={SCHOOL_PROGRAMS.reduce((s,x)=>s+x.students,0).toLocaleString()} color="#c8a84e" />
      </div>

      {/* CT cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {ctStats.map(({ ct, schools, teachers, students, meta }) => (
          <button
            key={ct}
            onClick={() => setExpanded(expanded === ct ? null : ct)}
            className="text-left rounded-xl border p-4 transition-all hover:shadow-md"
            style={{
              borderColor: expanded === ct ? meta.color : "var(--border)",
              background: expanded === ct ? meta.color + "10" : "var(--card)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded text-white"
                style={{ background: meta.color }}
              >
                {ct}
              </span>
              {expanded === ct
                ? <ChevronDown size={14} style={{ color: meta.color }} />
                : <ChevronRight size={14} className="text-muted-foreground" />}
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug mb-3">{meta.shortName}</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{schools} trường · {teachers} GV</p>
              <p className="text-xs text-muted-foreground">{students.toLocaleString()} học sinh</p>
            </div>
            {/* progress bar */}
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${Math.round((schools / totalSchools) * 100)}%`, background: meta.color }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((schools / totalSchools) * 100)}% số trường
            </p>
          </button>
        ))}
      </div>

      {/* Expanded CT detail */}
      {expanded && (
        <div className="bg-card border rounded-xl p-4" style={{ borderColor: STEM_PROGRAMS[expanded].color + "40" }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-bold px-3 py-1 rounded-lg text-white" style={{ background: STEM_PROGRAMS[expanded].color }}>
              {expanded}
            </span>
            <div>
              <p className="text-sm font-semibold">{STEM_PROGRAMS[expanded].name}</p>
              <p className="text-xs text-muted-foreground">{STEM_PROGRAMS[expanded].description}</p>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Các môn học trong chương trình:</p>
            <div className="flex flex-wrap gap-2">
              {CT_SUBJECTS[expanded].map((subj) => (
                <span key={subj} className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: STEM_PROGRAMS[expanded].color + "60", color: STEM_PROGRAMS[expanded].color }}>
                  {subj}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Cấp học áp dụng:</p>
            <div className="flex flex-wrap gap-2">
              {STEM_PROGRAMS[expanded].supportedGrades.map((g) => (
                <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-muted">{g}</span>
              ))}
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            {SCHOOL_PROGRAMS.filter(s => s.programs.includes(expanded)).length} trường đang triển khai:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SCHOOL_PROGRAMS.filter(s => s.programs.includes(expanded)).map((s) => (
              <div key={s.schoolId} className="text-xs p-2 rounded-lg bg-muted flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: STEM_PROGRAMS[expanded].color }} />
                <span className="truncate font-medium">{s.schoolName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter + Table */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ fontSize: "14px" }}>Danh sách trường theo chương trình</h3>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["all", ...CT_ORDER] as const).map((ct) => (
              <button
                key={ct}
                onClick={() => setSelectedCt(ct)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                style={selectedCt === ct
                  ? { background: ct === "all" ? ACCENT : STEM_PROGRAMS[ct as StemProgram].color, color: "#fff" }
                  : { color: "var(--muted-foreground)" }}
              >
                {ct === "all" ? "Tất cả" : ct}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Trường", "Quận/Huyện", "Cấp", "Chương trình đang dạy", "GV", "HS", "Từ ngày"].map((h) => (
                  <th key={h} className="text-left py-2 px-4 text-muted-foreground text-xs font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ fontSize: "13px" }}>
              {filteredSchools.map((s) => (
                <tr key={s.schoolId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 font-medium">{s.schoolName}</td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs">{s.district}</td>
                  <td className="py-2.5 px-4"><span className="text-xs px-1.5 py-0.5 rounded bg-muted">{s.tier}</span></td>
                  <td className="py-2.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {CT_ORDER.map((ct) => (
                        <span
                          key={ct}
                          className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={s.programs.includes(ct)
                            ? { background: STEM_PROGRAMS[ct].color, color: "#fff" }
                            : { background: "var(--muted)", color: "var(--muted-foreground)", opacity: 0.4 }}
                        >
                          {ct}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center">{s.teachers}</td>
                  <td className="py-2.5 px-4 text-center">{s.students.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-xs text-muted-foreground">{s.startDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>}

      {/* ── Tab: Thẩm định Nội dung ── */}
      {mainTab === "review" && (() => {
        const topics     = CONTENT_COVERAGE[reviewCt];
        const approved   = topics.filter(t => t.status === "approved").length;
        const pending    = topics.filter(t => t.status === "pending").length;
        const missing    = topics.filter(t => t.status === "missing").length;
        const coveragePct = Math.round((approved / topics.length) * 100);
        const meta       = STEM_PROGRAMS[reviewCt];

        return (
          <div className="space-y-4">
            {/* CT selector */}
            <div className="flex gap-2 flex-wrap">
              {CT_ORDER.map((ct) => {
                const m = STEM_PROGRAMS[ct];
                const tops = CONTENT_COVERAGE[ct];
                const pct  = Math.round((tops.filter(t => t.status === "approved").length / tops.length) * 100);
                return (
                  <button key={ct} onClick={() => setReviewCt(ct)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left"
                    style={reviewCt === ct
                      ? { borderColor: m.color, background: m.color + "12" }
                      : { borderColor: "var(--border)", background: "var(--card)" }}
                  >
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded text-white" style={{ background: m.color }}>{ct}</span>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{m.shortName}</p>
                      <p className="text-[10px]" style={{ color: pct >= 80 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626" }}>
                        {pct}% phủ
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Coverage summary */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold px-2.5 py-1 rounded-lg text-white" style={{ background: meta.color }}>{reviewCt}</span>
                  <div>
                    <p className="text-sm font-semibold">{meta.name}</p>
                    <p className="text-xs text-muted-foreground">{topics.length} chủ đề trong khung chương trình</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" />{approved} đã duyệt</span>
                  <span className="flex items-center gap-1 text-amber-600"><Clock className="w-3.5 h-3.5" />{pending} chờ duyệt</span>
                  <span className="flex items-center gap-1 text-red-600"><XCircle className="w-3.5 h-3.5" />{missing} chưa có</span>
                </div>
              </div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Tỉ lệ phủ học liệu đã duyệt</span>
                <span style={{ color: coveragePct >= 80 ? "#16a34a" : coveragePct >= 50 ? "#d97706" : "#dc2626", fontWeight: 600 }}>
                  {coveragePct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${coveragePct}%`, background: coveragePct >= 80 ? "#16a34a" : coveragePct >= 50 ? "#d97706" : "#dc2626" }} />
              </div>
              {missing > 0 && (
                <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    <span className="font-semibold">{missing} chủ đề chưa có học liệu</span> — Bộ cần yêu cầu NCC bổ sung trước kỳ học mới.
                  </p>
                </div>
              )}
            </div>

            {/* Topic table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Môn học", "Chủ đề / Tiết học STEM", "Cấp học", "Tham chiếu SGK", "NCC cung cấp", "Trạng thái"].map(h => (
                      <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {topics.map((t) => {
                    const statusMap = {
                      approved: { label: "Đã duyệt",   color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
                      pending:  { label: "Chờ duyệt",  color: "#d97706", bg: "#fffbeb", icon: Clock },
                      missing:  { label: "Chưa có HL", color: "#dc2626", bg: "#fef2f2", icon: XCircle },
                    };
                    const s = statusMap[t.status];
                    const SIcon = s.icon;
                    return (
                      <tr key={t.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-4 text-xs font-medium text-gray-700">{t.subject}</td>
                        <td className="py-2.5 px-4 text-xs text-gray-900">{t.topic}</td>
                        <td className="py-2.5 px-4"><span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{t.grade}</span></td>
                        <td className="py-2.5 px-4 text-[11px] text-muted-foreground">{t.sgkRef}</td>
                        <td className="py-2.5 px-4 text-[11px] text-muted-foreground">{t.submittedBy || "—"}</td>
                        <td className="py-2.5 px-4">
                          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full w-fit"
                            style={{ color: s.color, background: s.bg }}>
                            <SIcon className="w-3 h-3" />{s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
