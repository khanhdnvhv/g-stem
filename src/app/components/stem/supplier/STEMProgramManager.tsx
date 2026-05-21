import { toast } from "@/app/lib/toast";
import {
    BarChart3,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Clock,
    Eye,
    GraduationCap,
    Info,
    Lock,
    Pencil,
    Plus,
    Puzzle,
    Save, X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { StemProgram } from "../../mock-data/index";
import { STEM_PROGRAMS, STEM_PROGRAM_LIST, lessons } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { CTSelectorWizard } from "./CTSelectorWizard";

/* ================================================================ */
/*  STEM PROGRAM MANAGER — NCC khai báo gói triển khai CT1-CT5       */
/*  CT1-CT5 = khung chuẩn Bộ GD&ĐT (read-only)                      */
/*  NCC tạo "Gói Chương trình" là implementation riêng cho mỗi CT   */
/* ================================================================ */

interface NccPackage {
  name: string;
  description: string;
  targetGrades: string[];
  status: "draft" | "active";
}

const GRADE_LEVELS: readonly string[] = ["Mầm non", "Tiểu học", "THCS", "THPT"];

const MATERIAL_TYPES = [
  { key: "khtc",  label: "Kế hoạch giáo dục" },
  { key: "tlbd",  label: "Tài liệu bồi dưỡng GV" },
  { key: "khbd",  label: "Kế hoạch bài dạy" },
  { key: "pptx",  label: "Bài giảng PPTX/Slides" },
  { key: "vidgv", label: "Video GV hướng dẫn" },
  { key: "vidhs", label: "Video HS thực hành" },
  { key: "phht",  label: "Phiếu học tập" },
  { key: "dmtb",  label: "Danh mục thiết bị" },
  { key: "bttk",  label: "Bài tập kiểm tra" },
];

const DEFAULT_PACKAGES: Record<StemProgram, NccPackage> = {
  CT1: {
    name: "Gói Robotic & Coding",
    description: "Bộ học liệu toàn diện cho chương trình Robotic và Lập trình theo chuẩn CT1, phù hợp cấp Tiểu học và THCS.",
    targetGrades: ["Tiểu học", "THCS"],
    status: "active",
  },
  CT2: {
    name: "Gói AI & IoT",
    description: "Học liệu Trí tuệ nhân tạo và Internet of Things, tập trung vào ứng dụng thực tiễn cấp THCS–THPT.",
    targetGrades: ["THCS", "THPT"],
    status: "active",
  },
  CT3: {
    name: "Gói STEM Tích hợp",
    description: "Tích hợp liên môn Khoa học–Công nghệ–Kỹ thuật–Toán, dành riêng cho cấp Tiểu học.",
    targetGrades: ["Tiểu học"],
    status: "draft",
  },
  CT4: {
    name: "Gói STEM Cơ bản",
    description: "Chương trình STEM nhập môn phù hợp lứa tuổi Mầm non và Tiểu học, chú trọng tư duy trải nghiệm.",
    targetGrades: ["Mầm non", "Tiểu học"],
    status: "active",
  },
  CT5: {
    name: "Gói STEM Nâng cao",
    description: "Học liệu chuyên sâu dành cho THCS–THPT, định hướng thi đấu STEM quốc tế.",
    targetGrades: ["THCS", "THPT"],
    status: "draft",
  },
};

function mockCount(ctCode: StemProgram, matIdx: number, grade: string): number {
  const ctIdx = ["CT1", "CT2", "CT3", "CT4", "CT5"].indexOf(ctCode);
  const gradeIdx = GRADE_LEVELS.indexOf(grade);
  if (gradeIdx < 0) return 0;
  return (ctIdx * 31 + matIdx * 17 + gradeIdx * 11) % 9;
}

/* ── NCC Package edit form ── */
function PackageForm({
  pkg,
  onSave,
  onCancel,
}: {
  pkg: NccPackage;
  onSave: (draft: NccPackage) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(pkg.name);
  const [description, setDescription] = useState(pkg.description);
  const [targetGrades, setTargetGrades] = useState<string[]>(pkg.targetGrades);
  const [status, setStatus] = useState<"draft" | "active">(pkg.status);

  const toggleGrade = (g: string) =>
    setTargetGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );

  /* Validation */
  const nameValid = name.trim().length >= 3;
  const descValid = description.trim().length >= 20;
  const gradesValid = targetGrades.length > 0;
  const formValid = nameValid && descValid && gradesValid;

  return (
    <div className="p-4 border-t border-border bg-secondary/20 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-muted-foreground block mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>
            Tên gói chương trình
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Gói STEM Robotic Cơ bản"
            className={`w-full px-3 py-2 bg-card border rounded-lg outline-none ${
              !nameValid && name.length > 0 ? "border-orange-400" : "border-border focus:border-[#990803]"
            }`}
            style={{ fontSize: "13px" }}
          />
          {!nameValid && name.length > 0 && (
            <p className="text-orange-500 mt-1" style={{ fontSize: "11px" }}>Tên gói tối thiểu 3 ký tự</p>
          )}
        </div>
        <div>
          <label className="text-muted-foreground block mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>
            Trạng thái triển khai
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "active")}
            className="w-full px-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#990803]"
            style={{ fontSize: "13px" }}
          >
            <option value="draft">Nháp</option>
            <option value="active">Đang triển khai</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-muted-foreground block mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>
            Mô tả gói
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Mô tả nội dung, phạm vi triển khai của gói chương trình (≥ 20 ký tự)..."
            className={`w-full px-3 py-2 bg-card border rounded-lg outline-none resize-none ${
              !descValid && description.length > 0 ? "border-orange-400" : "border-border focus:border-[#990803]"
            }`}
            style={{ fontSize: "13px" }}
          />
          {!descValid && description.length > 0 && (
            <p className="text-orange-500 mt-1" style={{ fontSize: "11px" }}>
              Cần thêm {20 - description.trim().length} ký tự nữa
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="text-muted-foreground block mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>
            Cấp học triển khai
            {!gradesValid && <span className="text-orange-500 ml-1">— chọn ít nhất 1 cấp</span>}
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {GRADE_LEVELS.map((g) => (
              <button
                key={g}
                onClick={() => toggleGrade(g)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  targetGrades.includes(g)
                    ? "bg-[#990803] text-white border-[#990803]"
                    : "bg-card border-border hover:bg-secondary"
                }`}
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg hover:bg-secondary"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          <X className="w-3.5 h-3.5" /> Hủy
        </button>
        <button
          disabled={!formValid}
          onClick={() => formValid && onSave({ name: name.trim(), description: description.trim(), targetGrades, status })}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          <Save className="w-3.5 h-3.5" /> Lưu gói
        </button>
      </div>
    </div>
  );
}

/* ── Coverage Map 9 loại × cấp học ── */
function CoverageMap({ ctCode, targetGrades }: { ctCode: StemProgram; targetGrades: string[] }) {
  if (targetGrades.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground"
        style={{ fontSize: "12px" }}>
        Chưa chọn cấp học triển khai. Chỉnh sửa gói để thêm cấp học.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
            <BarChart3 className="w-4 h-4 text-[#990803]" /> Bản đồ phủ sóng học liệu
          </h3>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
            9 loại học liệu chuẩn × cấp học NCC triển khai. Nhấn ô để lọc ngân hàng nội dung.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: "12px" }}>
          <thead>
            <tr className="bg-secondary/40">
              <th className="px-4 py-2.5 text-left text-muted-foreground font-semibold" style={{ minWidth: "200px" }}>
                Loại học liệu
              </th>
              {targetGrades.map((g) => (
                <th key={g} className="px-3 py-2.5 text-center text-muted-foreground font-semibold"
                  style={{ minWidth: "90px" }}>
                  {g}
                </th>
              ))}
              <th className="px-3 py-2.5 text-center text-muted-foreground font-semibold">Tổng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MATERIAL_TYPES.map((mt, matIdx) => {
              const counts = targetGrades.map((g) => mockCount(ctCode, matIdx, g));
              const total = counts.reduce((s, c) => s + c, 0);
              return (
                <tr key={mt.key} className="hover:bg-secondary/30">
                  <td className="px-4 py-2.5">
                    <span className="text-foreground" style={{ fontWeight: 500 }}>{mt.label}</span>
                  </td>
                  {counts.map((c, gi) => (
                    <td key={gi} className="px-3 py-2.5 text-center">
                      {c > 0 ? (
                        <button
                          onClick={() => toast.info(`Lọc: ${mt.label} / ${targetGrades[gi]}`)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#990803]/10 text-[#990803] hover:bg-[#990803]/20 transition-colors"
                          style={{ fontSize: "12px", fontWeight: 700 }}
                        >
                          {c}
                        </button>
                      ) : (
                        <button
                          onClick={() => toast.info(`Soạn học liệu: ${mt.label} / ${targetGrades[gi]}`)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-dashed border-border text-muted-foreground hover:border-[#990803]/40 hover:text-[#990803] transition-colors"
                          style={{ fontSize: "10px" }}
                        >
                          +
                        </button>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-center">
                    <span style={{ fontWeight: 700, color: total > 0 ? "#16a34a" : "#94a3b8" }}>
                      {total > 0 ? total : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-secondary/40">
              <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                Tổng cộng
              </td>
              {targetGrades.map((g) => {
                const colTotal = MATERIAL_TYPES.reduce((s, _, mi) => s + mockCount(ctCode, mi, g), 0);
                return (
                  <td key={g} className="px-3 py-2.5 text-center" style={{ fontWeight: 700 }}>
                    {colTotal}
                  </td>
                );
              })}
              <td className="px-3 py-2.5 text-center" style={{ fontWeight: 700, color: "#990803" }}>
                {MATERIAL_TYPES.reduce(
                  (s, _, mi) => s + targetGrades.reduce((gs, g) => gs + mockCount(ctCode, mi, g), 0),
                  0,
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ── Main component ── */
export function STEMProgramManager() {
  const [activeCode, setActiveCode] = useState<StemProgram>("CT1");
  const [packages, setPackages] = useState<Record<StemProgram, NccPackage>>(DEFAULT_PACKAGES);
  const [editingPkg, setEditingPkg] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const active = STEM_PROGRAMS[activeCode];
  const pkg = packages[activeCode];
  const relatedLessons = lessons.filter((l) => l.programCode === activeCode);

  const activePackageCount = (Object.values(packages) as NccPackage[]).filter(
    (p) => p.status === "active",
  ).length;

  const coverageTotal = MATERIAL_TYPES.reduce(
    (s, _, mi) => s + pkg.targetGrades.reduce((gs, g) => gs + mockCount(activeCode, mi, g), 0),
    0,
  );

  const savePkg = (draft: NccPackage) => {
    setPackages((prev) => ({ ...prev, [activeCode]: draft }));
    setEditingPkg(false);
    toast.success(`Đã lưu gói chương trình ${activeCode}`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Puzzle}
        title="Chương trình STEM"
        subtitle="Khai báo gói triển khai CT1–CT5. Khung chuẩn do Bộ GD&ĐT định nghĩa; NCC tạo gói nội dung riêng và theo dõi độ phủ 9 loại học liệu."
        accentColor="#990803"
        actions={
          <>
            <Link
              to="/supplier/content/library"
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <BookOpen className="w-4 h-4" /> Ngân hàng Nội dung
            </Link>
            <button
              onClick={() => setWizardOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" /> Soạn bài mới
            </button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tổng bài giảng</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#990803" }}>{lessons.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Gói đang triển khai</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#16a34a" }}>{activePackageCount}/5</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Bài giảng {activeCode}</p>
          <p style={{ fontSize: "24px", fontWeight: 700 }}>{relatedLessons.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Coverage {activeCode}</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#c8a84e" }}>{coverageTotal}</p>
        </div>
      </div>

      {/* 5 CT selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {STEM_PROGRAM_LIST.map((p) => {
          const lessonCount = lessons.filter((l) => l.programCode === p.code).length;
          const isActive = p.code === activeCode;
          const pkgStatus = packages[p.code].status;
          return (
            <button
              key={p.code}
              onClick={() => { setActiveCode(p.code); setEditingPkg(false); }}
              className={`bg-card rounded-xl border-2 p-4 text-left transition-all ${
                isActive ? "shadow-lg -translate-y-0.5" : "border-border hover:shadow-md"
              }`}
              style={{ borderColor: isActive ? p.color : undefined }}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: p.color, fontSize: "14px", fontWeight: 700 }}
                >
                  {p.code}
                </div>
                <span
                  className="px-1.5 py-0.5 rounded text-white"
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    backgroundColor: pkgStatus === "active" ? "#16a34a" : "#f59e0b",
                  }}
                >
                  {pkgStatus === "active" ? "LIVE" : "NHÁP"}
                </span>
              </div>
              <h3 className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>
                {p.shortName}
              </h3>
              <p className="text-muted-foreground line-clamp-2 mt-1" style={{ fontSize: "11px" }}>
                {p.description}
              </p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Bài giảng</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: p.color }}>{lessonCount}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Ministry Framework — read-only */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div
          className="p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${active.color}, ${active.color}bb)` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-3.5 h-3.5 opacity-80" />
            <span
              className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm"
              style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}
            >
              KHUNG CHUẨN BỘ GD&amp;ĐT
            </span>
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{active.name}</h2>
          <p className="opacity-90 mt-1" style={{ fontSize: "13px", lineHeight: 1.6, maxWidth: "800px" }}>
            {active.description}
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-muted-foreground"
              style={{ fontSize: "11px", fontWeight: 600 }}>
              <GraduationCap className="w-3.5 h-3.5" /> CẤP HỌC HỖ TRỢ
            </div>
            <div className="flex flex-wrap gap-1.5">
              {active.supportedGrades.map((g) => (
                <span key={g} className="px-2 py-1 rounded-md bg-secondary text-foreground"
                  style={{ fontSize: "11px", fontWeight: 500 }}>{g}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-muted-foreground"
              style={{ fontSize: "11px", fontWeight: 600 }}>
              <BookOpen className="w-3.5 h-3.5" /> BỘ MÔN ÁP DỤNG
            </div>
            <div className="flex flex-wrap gap-1.5">
              {active.supportedSubjects.map((s) => (
                <span key={s} className="px-2 py-1 rounded-md bg-secondary text-foreground"
                  style={{ fontSize: "11px", fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NCC Package Declaration */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
              Gói Chương trình của bạn — {activeCode}
            </h3>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
              Khai báo gói nội dung NCC triển khai cho khung chuẩn {activeCode}
            </p>
          </div>
          {!editingPkg && (
            <button
              onClick={() => setEditingPkg(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg hover:bg-secondary transition-colors"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          )}
        </div>

        {editingPkg ? (
          <PackageForm pkg={pkg} onSave={savePkg} onCancel={() => setEditingPkg(false)} />
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{pkg.name}</h4>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: pkg.status === "active" ? "#16a34a" : "#f59e0b",
                  backgroundColor: pkg.status === "active" ? "#16a34a20" : "#f59e0b20",
                }}
              >
                {pkg.status === "active" ? (
                  <><CheckCircle2 className="w-3 h-3" /> Đang triển khai</>
                ) : (
                  <><Clock className="w-3 h-3" /> Nháp</>
                )}
              </span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: "12.5px", lineHeight: 1.6 }}>
              {pkg.description}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                Cấp học:
              </span>
              {pkg.targetGrades.length > 0 ? (
                pkg.targetGrades.map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-md bg-[#990803]/10 text-[#990803]"
                    style={{ fontSize: "11px", fontWeight: 600 }}>{g}</span>
                ))
              ) : (
                <span className="text-muted-foreground italic" style={{ fontSize: "11px" }}>
                  Chưa chọn
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Coverage Map */}
      <CoverageMap ctCode={activeCode} targetGrades={pkg.targetGrades} />

      {/* Lessons */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ProgramBadge code={activeCode} size="md" />
            <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
              Bài giảng {activeCode}
            </h3>
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
              ({relatedLessons.length})
            </span>
          </div>
          <Link
            to="/supplier/content/library"
            className="flex items-center gap-1 text-[#990803] hover:underline"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {relatedLessons.slice(0, 6).map((l) => (
            <div key={l.id} className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
              <img src={l.thumbnail} alt={l.title} className="w-12 h-12 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {l.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                    {l.subject} · {l.gradeLevel}
                  </span>
                  {l.sgkMapping && (
                    <span className="px-1.5 py-0.5 rounded bg-[#2563eb]/10 text-[#2563eb]"
                      style={{ fontSize: "10px" }}>SGK</span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-secondary"
                    style={{ fontSize: "10px" }}>{l.durationMinutes}p</span>
                </div>
              </div>
              <Link
                to={`/supplier/content/library/${l.id}`}
                className="p-2 rounded-lg hover:bg-secondary"
              >
                <Eye className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          ))}
          {relatedLessons.length === 0 && (
            <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
              Chưa có bài giảng.{" "}
              <Link to="/supplier/content/authoring" className="text-[#990803] hover:underline">
                Soạn bài đầu tiên →
              </Link>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border flex items-center justify-between">
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            <Plus className="w-3.5 h-3.5" /> Soạn bài mới cho {activeCode}
          </button>
          {relatedLessons.length > 6 && (
            <Link
              to="/supplier/content/library"
              className="text-[#990803] hover:underline"
              style={{ fontSize: "12px" }}
            >
              +{relatedLessons.length - 6} bài giảng khác
            </Link>
          )}
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-gradient-to-br from-[#c8a84e]/5 to-[#990803]/5 rounded-xl border border-border p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#990803] shrink-0 mt-0.5" />
        <div>
          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
            Về 5 chương trình STEM chuẩn
          </p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "12px", lineHeight: 1.6 }}>
            CT1–CT5 là 5 khung chương trình do Bộ GD&amp;ĐT và Geleximco định nghĩa. NCC không tạo
            mới hay đổi tên CT, nhưng khai báo gói nội dung riêng cho từng CT và theo dõi độ phủ
            9 loại học liệu theo cấp học (Thông tư 32/2020, CV 1014).
          </p>
        </div>
      </div>

      <CTSelectorWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialCT={activeCode}
      />
    </div>
  );
}

export default STEMProgramManager;
