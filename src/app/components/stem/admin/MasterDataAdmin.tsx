import { useState } from "react";
import { useLocation, Link } from "react-router";
import {
  BookOpen, School, BookMarked, Boxes,
  GraduationCap, Plus, Edit2, Trash2, ChevronRight, Check,
} from "lucide-react";
import { PageHeader } from "../ui/PageHeader";

/* ================================================================ */
/*  MOCK DATA                                                        */
/* ================================================================ */

interface GradeLevel { id: string; code: string; name: string; shortName: string; order: number; }
interface Subject    { id: string; code: string; name: string; levels: string[]; stemRelevant: boolean; }

const GRADE_LEVELS: GradeLevel[] = [
  { id: "gl-1", code: "TH",   name: "Tiểu học",                     shortName: "TH",   order: 1 },
  { id: "gl-2", code: "THCS", name: "Trung học cơ sở",              shortName: "THCS", order: 2 },
  { id: "gl-3", code: "THPT", name: "Trung học phổ thông",           shortName: "THPT", order: 3 },
];

const SUBJECTS: Subject[] = [
  { id: "s-01", code: "TOAN",   name: "Toán",                    levels: ["TH","THCS","THPT"], stemRelevant: true  },
  { id: "s-02", code: "LY",     name: "Vật lý",                  levels: ["THCS","THPT"],      stemRelevant: true  },
  { id: "s-03", code: "HOA",    name: "Hoá học",                  levels: ["THCS","THPT"],      stemRelevant: true  },
  { id: "s-04", code: "SINH",   name: "Sinh học",                 levels: ["THCS","THPT"],      stemRelevant: true  },
  { id: "s-05", code: "TIN",    name: "Tin học",                  levels: ["TH","THCS","THPT"], stemRelevant: true  },
  { id: "s-06", code: "KHTN",   name: "Khoa học tự nhiên",        levels: ["THCS"],             stemRelevant: true  },
  { id: "s-07", code: "KHTNCN", name: "Khoa học & Công nghệ",     levels: ["TH"],               stemRelevant: true  },
  { id: "s-08", code: "VAN",    name: "Ngữ văn",                  levels: ["TH","THCS","THPT"], stemRelevant: false },
  { id: "s-09", code: "ANH",    name: "Tiếng Anh",                levels: ["TH","THCS","THPT"], stemRelevant: false },
  { id: "s-10", code: "SU",     name: "Lịch sử",                  levels: ["THCS","THPT"],      stemRelevant: false },
  { id: "s-11", code: "DIA",    name: "Địa lý",                   levels: ["THCS","THPT"],      stemRelevant: false },
  { id: "s-12", code: "GDCD",   name: "Giáo dục công dân",        levels: ["THCS","THPT"],      stemRelevant: false },
];

interface SchoolType { id: string; code: string; name: string; count: number; }

const SCHOOL_TYPES: SchoolType[] = [
  { id: "st-1", code: "TH",   name: "Trường Tiểu học",             count: 312 },
  { id: "st-2", code: "THCS", name: "Trường THCS",                  count: 187 },
  { id: "st-3", code: "THPT", name: "Trường THPT",                  count: 89  },
  { id: "st-4", code: "THCS_THPT", name: "Trường THCS–THPT (ghép)", count: 34  },
  { id: "st-5", code: "TH_THCS",  name: "Trường TH–THCS (ghép)",   count: 18  },
];

interface Province { id: string; code: string; name: string; region: string; }

const PROVINCES: Province[] = [
  { id: "p-01", code: "HN",  name: "Hà Nội",             region: "Miền Bắc" },
  { id: "p-02", code: "HCM", name: "TP. Hồ Chí Minh",    region: "Miền Nam" },
  { id: "p-03", code: "DN",  name: "Đà Nẵng",            region: "Miền Trung" },
  { id: "p-04", code: "HP",  name: "Hải Phòng",          region: "Miền Bắc" },
  { id: "p-05", code: "CT",  name: "Cần Thơ",            region: "Miền Nam" },
  { id: "p-06", code: "BD",  name: "Bình Dương",         region: "Miền Nam" },
  { id: "p-07", code: "DNG", name: "Đồng Nai",           region: "Miền Nam" },
  { id: "p-08", code: "LA",  name: "Long An",            region: "Miền Nam" },
];

interface TextbookSeries { id: string; code: string; name: string; publisher: string; approvedYear: number; grades: string; subjects: number; }

const TEXTBOOK_SERIES: TextbookSeries[] = [
  { id: "tb-1", code: "CD",   name: "Cánh Diều",                publisher: "NXB ĐH Sư phạm",       approvedYear: 2020, grades: "1–12", subjects: 47 },
  { id: "tb-2", code: "KNTT", name: "Kết nối tri thức với cuộc sống", publisher: "NXB Giáo dục VN", approvedYear: 2020, grades: "1–12", subjects: 47 },
  { id: "tb-3", code: "CTST", name: "Chân trời sáng tạo",       publisher: "NXB Giáo dục VN",       approvedYear: 2020, grades: "1–12", subjects: 47 },
  { id: "tb-4", code: "GK-14", name: "Giáo khoa cũ 2014",       publisher: "NXB Giáo dục VN",       approvedYear: 2014, grades: "1–12", subjects: 40 },
];

interface MiscCategory { id: string; key: string; name: string; count: number; desc: string; }

const MISC_CATEGORIES: MiscCategory[] = [
  { id: "mc-1", key: "school_size",    name: "Quy mô trường",       count: 4,  desc: "Nhỏ / Trung bình / Lớn / Đặc biệt lớn" },
  { id: "mc-2", key: "area_type",      name: "Khu vực trường",       count: 3,  desc: "Nội thành / Ngoại thành / Nông thôn" },
  { id: "mc-3", key: "stem_program",   name: "Chương trình STEM",    count: 5,  desc: "CT1 đến CT5" },
  { id: "mc-4", key: "license_type",   name: "Loại License",         count: 3,  desc: "Học sinh / Giáo viên / Trường" },
  { id: "mc-5", key: "content_type",   name: "Loại nội dung",        count: 6,  desc: "Video / PDF / Bài giảng / Kiểm tra / Lab / Đồ án" },
  { id: "mc-6", key: "equipment_cat",  name: "Nhóm thiết bị",        count: 5,  desc: "Robotics / Electronics / 3D Print / Science / Coding" },
];

/* ================================================================ */
/*  TAB: BẬC HỌC & MÔN HỌC                                         */
/* ================================================================ */
function SubjectsTab() {
  const [showOnlyStem, setShowOnlyStem] = useState(false);
  const filtered = showOnlyStem ? SUBJECTS.filter((s) => s.stemRelevant) : SUBJECTS;

  return (
    <div className="p-4 space-y-4">
      {/* Grade levels */}
      <div>
        <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Bậc học</h3>
        <div className="grid grid-cols-3 gap-3">
          {GRADE_LEVELS.map((g) => (
            <div key={g.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4.5 h-4.5 text-blue-700" />
              </div>
              <div>
                <p className="font-semibold text-[13px]">{g.name}</p>
                <p className="text-muted-foreground text-[10.5px] font-mono">{g.code}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
            Môn học ({filtered.length})
          </h3>
          <label className="flex items-center gap-1.5 cursor-pointer text-[12px] text-muted-foreground select-none">
            <input type="checkbox" checked={showOnlyStem} onChange={(e) => setShowOnlyStem(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-600" />
            Chỉ môn STEM
          </label>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Môn học</th>
                <th className="px-4 py-2.5 text-left">Mã</th>
                <th className="px-4 py-2.5 text-left">Áp dụng cho</th>
                <th className="px-4 py-2.5 text-center">STEM</th>
                <th className="px-4 py-2.5 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{s.name}</td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground text-[11px]">{s.code}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1 flex-wrap">
                      {s.levels.map((lv) => (
                        <span key={lv} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-medium">{lv}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {s.stemRelevant
                      ? <Check className="w-3.5 h-3.5 text-green-600 mx-auto" />
                      : <span className="text-muted-foreground/30">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB: DANH MỤC TRƯỜNG                                            */
/* ================================================================ */
function SchoolsTab() {
  const totalSchools = SCHOOL_TYPES.reduce((s, t) => s + t.count, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-muted-foreground text-[11px]">Tổng số trường trong hệ thống</p>
          <p className="font-bold text-[26px] mt-0.5 text-[#0e7490]">{totalSchools.toLocaleString("vi-VN")}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-muted-foreground text-[11px]">Tỉnh / Thành phố</p>
          <p className="font-bold text-[26px] mt-0.5 text-[#1e40af]">{PROVINCES.length}</p>
          <p className="text-[10.5px] text-muted-foreground">(trong mock — thực tế 63)</p>
        </div>
      </div>

      {/* School types */}
      <div>
        <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Loại hình trường</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Loại hình</th>
                <th className="px-4 py-2.5 text-left">Mã</th>
                <th className="px-4 py-2.5 text-right">Số trường</th>
                <th className="px-4 py-2.5 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SCHOOL_TYPES.map((t) => (
                <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{t.name}</td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground text-[11px]">{t.code}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{t.count.toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provinces */}
      <div>
        <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tỉnh / Thành phố (mẫu)</h3>
        <div className="grid grid-cols-2 gap-2">
          {PROVINCES.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2">
              <span className="font-mono text-[10.5px] text-muted-foreground w-8 shrink-0">{p.code}</span>
              <span className="text-[12.5px] font-medium flex-1">{p.name}</span>
              <span className="text-[10.5px] text-muted-foreground">{p.region}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB: SÁCH GIÁO KHOA                                             */
/* ================================================================ */
function TextbooksTab() {
  return (
    <div className="p-4 space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-[12.5px] text-blue-800">
        <BookMarked className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
        <p>Danh mục bộ sách giáo khoa dùng để gắn nhãn nội dung học liệu theo chương trình GDPT 2018 và các bộ sách được Bộ GD&ĐT phê duyệt.</p>
      </div>

      {/* Series list */}
      <div className="space-y-3">
        {TEXTBOOK_SERIES.map((tb) => (
          <div key={tb.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <BookMarked className="w-5 h-5 text-violet-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[13px]">{tb.name}</p>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">{tb.code}</span>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">{tb.publisher}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex gap-4 text-[11.5px]">
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="font-medium text-foreground">Năm phê duyệt:</span> {tb.approvedYear}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="font-medium text-foreground">Khối:</span> {tb.grades}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="font-medium text-foreground">Môn học:</span> {tb.subjects} môn
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-border rounded-xl text-[12.5px] text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
        <Plus className="w-4 h-4" />
        Thêm bộ sách giáo khoa
      </button>
    </div>
  );
}

/* ================================================================ */
/*  TAB: DANH MỤC KHÁC                                              */
/* ================================================================ */
function MiscTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const MISC_VALUES: Record<string, string[]> = {
    school_size:   ["Nhỏ (< 500 HS)", "Trung bình (500–1.000 HS)", "Lớn (1.000–2.000 HS)", "Đặc biệt lớn (> 2.000 HS)"],
    area_type:     ["Nội thành / Nội ô", "Ngoại thành / Ven đô", "Nông thôn / Miền núi"],
    stem_program:  ["CT1 — Tin học & Lập trình", "CT2 — Robotics", "CT3 — Khoa học thực nghiệm", "CT4 — Thiết bị & Công nghệ", "CT5 — STEM tích hợp"],
    license_type:  ["Học sinh (per-student)", "Giáo viên (per-teacher)", "Trường (site license)"],
    content_type:  ["Video bài giảng", "PDF / Tài liệu", "Bài giảng tương tác", "Đề kiểm tra", "Lab mô phỏng", "Đồ án / Dự án"],
    equipment_cat: ["Robotics & Coding", "Điện tử & Arduino", "In 3D & CAD", "Khoa học thực nghiệm", "Công nghệ thông tin"],
  };

  return (
    <div className="p-4 space-y-3">
      {MISC_CATEGORIES.map((cat) => {
        const isOpen = expanded === cat.key;
        const values = MISC_VALUES[cat.key] ?? [];
        return (
          <div key={cat.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <button onClick={() => setExpanded(isOpen ? null : cat.key)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px]">{cat.name}</p>
                <p className="text-muted-foreground text-[11px] truncate">{cat.desc}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-muted-foreground">{cat.count} giá trị</span>
                <ChevronRight className={`w-4 h-4 text-muted-foreground/60 transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border bg-secondary/10">
                <div className="divide-y divide-border/60">
                  {values.map((v) => (
                    <div key={v} className="flex items-center gap-3 px-5 py-2 hover:bg-secondary/30 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                      <span className="text-[12.5px] flex-1">{v}</span>
                      <div className="flex items-center gap-1">
                        <button className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button className="p-1 hover:bg-red-50 rounded text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-2.5 border-t border-border/60">
                  <button className="flex items-center gap-1.5 text-[12px] text-primary hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Thêm giá trị
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================ */
/*  MAIN                                                            */
/* ================================================================ */
type TabKey = "subjects" | "schools" | "textbooks" | "misc";

const TAB_ROUTES: Record<string, TabKey> = {
  "/admin/master-data/subjects":  "subjects",
  "/admin/master-data/schools":   "schools",
  "/admin/master-data/textbooks": "textbooks",
  "/admin/master-data/misc":      "misc",
};

const TABS: { key: TabKey; to: string; label: string; icon: typeof BookOpen }[] = [
  { key: "subjects",  to: "/admin/master-data/subjects",  label: "Bậc học & Môn học", icon: BookOpen   },
  { key: "schools",   to: "/admin/master-data/schools",   label: "Danh mục Trường",   icon: School     },
  { key: "textbooks", to: "/admin/master-data/textbooks", label: "Sách giáo khoa",    icon: BookMarked },
  { key: "misc",      to: "/admin/master-data/misc",      label: "Danh mục khác",     icon: Boxes      },
];

export function MasterDataAdmin() {
  const { pathname } = useLocation();
  const activeTab: TabKey = TAB_ROUTES[pathname] ?? "subjects";

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Boxes}
        title="Danh mục dùng chung"
        subtitle="Quản lý dữ liệu nền tảng — bậc học, môn học, loại hình trường, sách giáo khoa và các danh mục tham chiếu."
        accentColor="#7c3aed"
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Tab nav */}
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map(({ key, to, label, icon: Icon }) => (
            <Link key={key} to={to}
              className={`flex items-center gap-1.5 px-5 py-3 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors
                ${activeTab === key
                  ? "border-[#7c3aed] text-[#7c3aed]"
                  : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>

        {activeTab === "subjects"  && <SubjectsTab />}
        {activeTab === "schools"   && <SchoolsTab />}
        {activeTab === "textbooks" && <TextbooksTab />}
        {activeTab === "misc"      && <MiscTab />}
      </div>
    </div>
  );
}
