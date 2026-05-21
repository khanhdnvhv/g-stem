import { toast } from "@/app/lib/toast";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2, Clock,
    Download,
    Eye,
    File,
    FileText, GraduationCap,
    History,
    Layers,
    Package,
    Pencil,
    Tag,
    Video,
    XCircle
} from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { STEM_PROGRAM_LIST, lessons } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { formatRelative } from "../ui/format";

/* ================================================================ */
/*  CONTENT ITEM DETAIL — Chi tiết bài giảng + Version Control      */
/* ================================================================ */

/* ── 9 loại học liệu chuẩn ── */
const MATERIAL_TYPES = [
  { key: "khtc",  label: "Kế hoạch giáo dục" },
  { key: "tlbd",  label: "TL bồi dưỡng GV" },
  { key: "khbd",  label: "Kế hoạch bài dạy" },
  { key: "pptx",  label: "Bài giảng Slides" },
  { key: "vidgv", label: "Video GV" },
  { key: "vidhs", label: "Video HS" },
  { key: "phht",  label: "Phiếu học tập" },
  { key: "dmtb",  label: "Danh mục thiết bị" },
  { key: "bttk",  label: "Bài tập kiểm tra" },
];

/* ── Tên gói NCC per CT (sync với STEMProgramManager) ── */
const CT_PACKAGE_NAMES: Record<string, string> = {
  CT1: "Gói Robotic & Coding",
  CT2: "Gói AI & IoT",
  CT3: "Gói STEM Tích hợp",
  CT4: "Gói STEM Cơ bản",
  CT5: "Gói STEM Nâng cao",
};

/* ── Helpers ── */
function coveredTypes(idx: number): Set<string> {
  return new Set(
    MATERIAL_TYPES.filter((_, i) => (idx * 7 + i * 11) % 3 !== 0).map((m) => m.key),
  );
}

function fileIcon(url: string) {
  const ext = (url.split(".").pop() ?? "").toLowerCase();
  if (["pptx", "ppt"].includes(ext))         return { Icon: Layers,   color: "#f59e0b", label: "Slides" };
  if (["mp4", "mov", "webm"].includes(ext))  return { Icon: Video,    color: "#0891b2", label: "Video"  };
  if (["pdf"].includes(ext))                 return { Icon: FileText, color: "#990803", label: "PDF"    };
  if (["docx", "doc"].includes(ext))         return { Icon: FileText, color: "#2563eb", label: "Word"   };
  if (["zip", "rar"].includes(ext))          return { Icon: Package,  color: "#16a34a", label: "ZIP"    };
  return                                            { Icon: File,     color: "#64748b", label: "File"   };
}

function shortFileName(url: string): string {
  const name = url.split("/").pop() ?? url;
  return name.length > 40 ? name.slice(0, 37) + "…" : name;
}

function parseSgk(mapping: string) {
  const parts = mapping.split(" - ").map((s) => s.trim());
  return {
    series: parts[0] ?? mapping,
    grade: parts[1] ?? "",
    lesson: parts.slice(2).join(" - "),
  };
}

/* ── Version history ── */
interface VersionEntry {
  version: string;
  at: string;
  author: string;
  note: string;
  isCurrent: boolean;
}

function makeVersions(lessonId: string): VersionEntry[] {
  const n = parseInt(lessonId.replace(/\D/g, "") || "1", 10);
  return [
    {
      version: "v3.0",
      at: new Date(Date.now() - 7 * 86400_000).toISOString(),
      author: n % 2 === 0 ? "Nguyễn Minh Trí" : "Trần Thị Lan",
      note: "Cập nhật hình ảnh minh họa, bổ sung phần bài tập thực hành",
      isCurrent: true,
    },
    {
      version: "v2.1",
      at: new Date(Date.now() - 30 * 86400_000).toISOString(),
      author: "Trần Thị Lan",
      note: "Sửa lỗi liên kết SGK, cập nhật video demo mới",
      isCurrent: false,
    },
    {
      version: "v1.0",
      at: new Date(Date.now() - 90 * 86400_000).toISOString(),
      author: "Nguyễn Minh Trí",
      note: "Tạo mới — phiên bản ban đầu",
      isCurrent: false,
    },
  ];
}

export function ContentItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = lessons.find((l) => l.id === id);

  /* Route editor theo CT — CT5 dùng ResearchProjectEditor */
  const openEditor = () => {
    if (!lesson) return;
    if (lesson.programCode === "CT5") {
      navigate(`/supplier/content/authoring/research/${lesson.id}`);
    } else {
      navigate(`/supplier/content/authoring/${lesson.id}`);
    }
  };

  if (!lesson) {
    return (
      <div className="p-10 text-center space-y-3">
        <p className="text-muted-foreground">
          Không tìm thấy bài giảng <strong>{id}</strong>.
        </p>
        <Link to="/supplier/content/library"
          className="text-[#990803] underline" style={{ fontSize: "13px" }}>
          ← Quay lại Ngân hàng Nội dung
        </Link>
      </div>
    );
  }

  const idx = lessons.indexOf(lesson);
  const views       = 800 + (idx * 137) % 4000;
  const schoolsUsing = 5 + (idx * 7) % 40;
  const rating      = +(3.8 + ((idx * 11) % 15) / 10).toFixed(1);
  const isPublished = idx % 9 !== 0;
  const versions    = useMemo(() => makeVersions(lesson.id), [lesson.id]);
  const covered     = useMemo(() => coveredTypes(idx), [idx]);
  const sgk         = lesson.sgkMapping ? parseSgk(lesson.sgkMapping) : null;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2" style={{ fontSize: "12px" }}>
        <Link to="/supplier/content/library"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Ngân hàng Nội dung
        </Link>
        <span className="text-muted-foreground">/</span>
        <ProgramBadge code={lesson.programCode} size="xs" />
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground truncate" style={{ maxWidth: "240px" }}>{lesson.title}</span>
      </div>

      <PageHeader
        icon={BookOpen}
        title={lesson.title}
        subtitle={`${lesson.programCode} · ${lesson.subject} · ${lesson.gradeLevel} · ${lesson.durationMinutes} phút`}
        accentColor="#990803"
        badge={
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
            isPublished ? "bg-[#16a34a]/15 text-[#16a34a]" : "bg-[#64748b]/15 text-[#64748b]"
          }`}>
            {isPublished
              ? <><CheckCircle2 className="w-3 h-3" /> Đã xuất bản</>
              : <><Clock className="w-3 h-3" /> Bản nháp</>}
          </span>
        }
        actions={
          <>
            <button
              onClick={() => toast.info("Xuất bài giảng ra PDF / SCORM")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất
            </button>
            <button
              onClick={openEditor}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Eye className="w-4 h-4" /> Xem trước
            </button>
            <button
              onClick={openEditor}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Pencil className="w-4 h-4" /> Chỉnh sửa
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ══ LEFT ══ */}
        <div className="lg:col-span-2 space-y-4">

          {/* Hero: thumbnail + stats + description */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="h-52 relative">
              <img
                src={lesson.thumbnail}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <ProgramBadge code={lesson.programCode} size="md" />
              </div>
            </div>

            {/* 4-stat row */}
            <div className="grid grid-cols-4 divide-x divide-border border-t border-border">
              {[
                { label: "Lượt xem",   value: views.toLocaleString() },
                { label: "Trường dùng", value: schoolsUsing },
                { label: "Đánh giá",   value: `${rating}★`,  color: "#c8a84e" },
                { label: "Thời lượng", value: `${lesson.durationMinutes}p` },
              ].map(({ label, value, color }) => (
                <div key={label} className="py-3 text-center">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{label}</p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: color ?? "inherit" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="px-4 py-3 border-t border-border">
              <p className="text-muted-foreground" style={{ fontSize: "12.5px", lineHeight: 1.65 }}>
                {lesson.description}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 style={{ fontSize: "13px", fontWeight: 600 }}>Thông tin bài giảng</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {([
                { label: "Chương trình", value: <ProgramBadge code={lesson.programCode} size="sm" /> },
                { label: "Môn học",      value: lesson.subject },
                { label: "Cấp học",      value: lesson.gradeLevel },
                { label: "Thời lượng",   value: `${lesson.durationMinutes} phút` },
                { label: "Tạo bởi",      value: lesson.createdBy },
                { label: "Ngày tạo",     value: formatRelative(lesson.createdAt) },
              ] as { label: string; value: React.ReactNode }[]).map(({ label, value }) => (
                <div key={label}>
                  <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{label}</p>
                  <div style={{ fontSize: "12.5px", fontWeight: 500, marginTop: "2px" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* SGK mapping — structured */}
            {sgk && (
              <div className="pt-3 border-t border-border">
                <p className="text-muted-foreground mb-1.5 flex items-center gap-1"
                  style={{ fontSize: "10.5px", fontWeight: 600 }}>
                  <Tag className="w-3 h-3" /> GẮN KẾT SGK
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 rounded-md bg-[#2563eb]/10 text-[#2563eb]"
                    style={{ fontSize: "11px", fontWeight: 600 }}>
                    {sgk.series}
                  </span>
                  {sgk.grade && (
                    <span className="px-2 py-1 rounded-md bg-secondary text-foreground"
                      style={{ fontSize: "11px", fontWeight: 500 }}>
                      {sgk.grade}
                    </span>
                  )}
                  {sgk.lesson && (
                    <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                      {sgk.lesson}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Resources — with file type icons */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-3 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
              <FileText className="w-4 h-4" />
              Tài nguyên đính kèm ({lesson.resourceUrls.length})
            </h3>
            <div className="space-y-1.5">
              {lesson.resourceUrls.map((url, i) => {
                const fi = fileIcon(url);
                return (
                  <div key={i}
                    className="flex items-center gap-2.5 p-2.5 bg-secondary/30 rounded-lg hover:bg-secondary/60 transition-colors group">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: fi.color + "20" }}>
                      <fi.Icon className="w-3.5 h-3.5" style={{ color: fi.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono truncate" style={{ fontSize: "11.5px" }}>
                        {shortFileName(url)}
                      </p>
                    </div>
                    <span
                      className="px-1.5 py-0.5 rounded text-white shrink-0"
                      style={{ fontSize: "9px", fontWeight: 700, backgroundColor: fi.color }}>
                      {fi.label}
                    </span>
                    <button
                      onClick={() => toast.info(`Tải xuống: ${shortFileName(url)}`)}
                      className="p-1.5 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={openEditor}
              className="mt-2 w-full py-2 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-[#990803]/40 hover:text-[#990803] transition-colors"
              style={{ fontSize: "12px" }}>
              + Đính kèm tài nguyên (mở Studio)
            </button>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="space-y-4">

          {/* Version history */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-4 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
              <History className="w-4 h-4 text-[#0891b2]" /> Lịch sử phiên bản
            </h3>
            <div className="relative">
              {versions.map((v, i) => (
                <div key={v.version}
                  className={`relative flex gap-3 ${i < versions.length - 1 ? "pb-5" : ""}`}>
                  {i < versions.length - 1 && (
                    <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-border" />
                  )}
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 z-10 ${
                    v.isCurrent ? "bg-[#16a34a] border-[#16a34a]" : "bg-card border-border"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-foreground" style={{ fontSize: "12.5px", fontWeight: 700 }}>
                        {v.version}
                      </span>
                      {v.isCurrent && (
                        <span className="px-1 py-0.5 bg-[#16a34a]/15 text-[#16a34a] rounded"
                          style={{ fontSize: "9px", fontWeight: 700 }}>
                          HIỆN TẠI
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                      {formatRelative(v.at)} · {v.author}
                    </p>
                    <p className="text-foreground mt-0.5" style={{ fontSize: "11.5px", lineHeight: 1.4 }}>
                      {v.note}
                    </p>
                    {!v.isCurrent && (
                      <button
                        onClick={() => toast.info(`Khôi phục phiên bản ${v.version}`)}
                        className="mt-1 text-[#0891b2] hover:underline"
                        style={{ fontSize: "10.5px", fontWeight: 500 }}>
                        Khôi phục
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => toast.success("Tạo phiên bản mới")}
              className="mt-3 w-full py-1.5 bg-[#0891b2]/10 text-[#0891b2] rounded-lg hover:bg-[#0891b2]/20 transition-colors"
              style={{ fontSize: "11.5px", fontWeight: 600 }}>
              + Tạo phiên bản mới
            </button>
          </div>

          {/* Phân phối trong gói — fixed: dùng 5 CT packages thực */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-3 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
              <GraduationCap className="w-4 h-4" /> Phân phối trong gói
            </h3>
            <div className="space-y-1.5">
              {STEM_PROGRAM_LIST.map((p) => {
                const included = lesson.programCode === p.code;
                return (
                  <div key={p.code} className="flex items-center gap-2">
                    {included ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: p.color }} />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-border shrink-0" />
                    )}
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: included ? 600 : 400,
                        color: included ? "var(--foreground)" : "var(--muted-foreground)",
                      }}>
                      {CT_PACKAGE_NAMES[p.code]}
                    </span>
                    {included && (
                      <span
                        className="ml-auto px-1.5 py-0.5 rounded text-white"
                        style={{ fontSize: "9px", fontWeight: 700, backgroundColor: p.color }}>
                        {p.code}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Loại học liệu — 9-type checklist */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: "13px", fontWeight: 600 }}>Loại học liệu</h3>
              <span
                className="text-muted-foreground"
                style={{ fontSize: "10.5px" }}>
                {covered.size}/9 loại
              </span>
            </div>
            {/* mini progress bar */}
            <div className="h-1.5 bg-secondary rounded-full mb-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#16a34a] transition-all"
                style={{ width: `${(covered.size / 9) * 100}%` }}
              />
            </div>
            <div className="space-y-1.5">
              {MATERIAL_TYPES.map((mt) => {
                const has = covered.has(mt.key);
                return (
                  <div key={mt.key} className="flex items-center gap-2">
                    {has ? (
                      <CheckCircle2 className="w-3 h-3 text-[#16a34a] shrink-0" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-border shrink-0" />
                    )}
                    <span
                      style={{
                        fontSize: "11px",
                        color: has ? "var(--foreground)" : "var(--muted-foreground)",
                        fontWeight: has ? 500 : 400,
                      }}>
                      {mt.label}
                    </span>
                    {!has && (
                      <button
                        onClick={openEditor}
                        className="ml-auto text-[#990803] hover:underline"
                        style={{ fontSize: "10px", fontWeight: 500 }}>
                        + Thêm
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ContentItemDetail;
