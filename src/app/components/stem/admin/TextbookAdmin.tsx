import { useState } from "react";
import {
  Plus, Pencil, EyeOff, Eye, X, Check, AlertTriangle, Search, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

/* ── Types ─────────────────────────────────────────────── */

interface Textbook {
  id: string;
  name: string;
  code: string;
  levelId: string;
  subjectCode: string;
  subjectName: string;
  grades: string[];
  publisher: string;
  publishYear: number;
  status: "active" | "hidden";
}

interface ModalState {
  name: string; code: string; codeEdited: boolean; codeError: string;
  levelId: string; subjectCode: string; grades: string[];
  publisher: string; publishYear: number; status: "active" | "hidden";
}

/* ── Reference data ─────────────────────────────────────── */

const LEVELS = [
  { id: "LV-01", name: "Mầm non" },
  { id: "LV-02", name: "Tiểu học" },
  { id: "LV-03", name: "Trung học cơ sở" },
  { id: "LV-04", name: "Trung học phổ thông" },
  { id: "LV-05", name: "Cao đẳng / Nghề" },
  { id: "LV-06", name: "Đại học" },
];

const SUBJECTS_BY_LEVEL: Record<string, Array<{ code: string; name: string }>> = {
  "LV-01": [{ code:"KHKH", name:"Khám phá khoa học" }, { code:"HDTH", name:"Hoạt động tạo hình" }, { code:"AN", name:"Âm nhạc" }, { code:"PTNN", name:"Phát triển ngôn ngữ" }, { code:"GDTC", name:"Giáo dục thể chất" }],
  "LV-02": [{ code:"T", name:"Toán" }, { code:"TV", name:"Tiếng Việt" }, { code:"TNXH", name:"Tự nhiên & Xã hội" }, { code:"KH", name:"Khoa học" }, { code:"THTL", name:"Tin học" }, { code:"AN", name:"Âm nhạc" }, { code:"MT", name:"Mĩ thuật" }, { code:"TA", name:"Tiếng Anh" }, { code:"DD", name:"Đạo đức" }],
  "LV-03": [{ code:"T", name:"Toán" }, { code:"NV", name:"Ngữ văn" }, { code:"VL", name:"Vật lý" }, { code:"HH", name:"Hóa học" }, { code:"SH", name:"Sinh học" }, { code:"LS", name:"Lịch sử" }, { code:"DL", name:"Địa lý" }, { code:"TA", name:"Tiếng Anh" }, { code:"CN", name:"Công nghệ" }, { code:"TH", name:"Tin học" }],
  "LV-04": [{ code:"T", name:"Toán" }, { code:"NV", name:"Ngữ văn" }, { code:"TA", name:"Tiếng Anh" }, { code:"VL", name:"Vật lý" }, { code:"HH", name:"Hóa học" }, { code:"SH", name:"Sinh học" }, { code:"CN", name:"Công nghệ" }, { code:"TH", name:"Tin học" }, { code:"LS", name:"Lịch sử" }, { code:"DL", name:"Địa lý" }],
  "LV-05": [{ code:"TUD", name:"Toán ứng dụng" }, { code:"TAKT", name:"Tiếng Anh kỹ thuật" }, { code:"LTC", name:"Lập trình cơ bản" }],
  "LV-06": [{ code:"TCC", name:"Toán cao cấp" }, { code:"THML", name:"Triết học Mác-Lênin" }],
};

const GRADES_BY_LEVEL: Record<string, Array<{ code: string; name: string }>> = {
  "LV-01": [{ code:"NT", name:"Nhà trẻ" }, { code:"LC", name:"Lớp Chồi" }, { code:"LL", name:"Lớp Lá" }],
  "LV-02": [{ code:"L1", name:"Lớp 1" }, { code:"L2", name:"Lớp 2" }, { code:"L3", name:"Lớp 3" }, { code:"L4", name:"Lớp 4" }, { code:"L5", name:"Lớp 5" }],
  "LV-03": [{ code:"L6", name:"Lớp 6" }, { code:"L7", name:"Lớp 7" }, { code:"L8", name:"Lớp 8" }, { code:"L9", name:"Lớp 9" }],
  "LV-04": [{ code:"L10", name:"Lớp 10" }, { code:"L11", name:"Lớp 11" }, { code:"L12", name:"Lớp 12" }],
  "LV-05": [{ code:"N1", name:"Năm 1" }, { code:"N2", name:"Năm 2" }, { code:"N3", name:"Năm 3" }],
  "LV-06": [{ code:"DH1", name:"Năm 1" }, { code:"DH2", name:"Năm 2" }],
};

const PUBLISHERS = [
  "NXB Giáo dục Việt Nam", "Cánh Diều", "Kết nối tri thức với cuộc sống",
  "Chân trời sáng tạo", "NXB Đại học Sư phạm", "NXB Đại học Quốc gia",
];

/* ── Mock data ──────────────────────────────────────────── */

const INITIAL_TEXTBOOKS: Textbook[] = [
  { id:"TB-MN-01", name:"Bé khám phá khoa học",         code:"BKHKH",   levelId:"LV-01", subjectCode:"KHKH", subjectName:"Khám phá khoa học",  grades:["NT","LC","LL"], publisher:"NXB Giáo dục Việt Nam",           publishYear:2023, status:"active" },
  { id:"TB-MN-02", name:"Bé vui âm nhạc",               code:"BVAN",    levelId:"LV-01", subjectCode:"AN",   subjectName:"Âm nhạc",            grades:["LC","LL"],     publisher:"Cánh Diều",                       publishYear:2023, status:"active" },
  { id:"TB-TH-01", name:"Toán 1 - Cánh Diều",           code:"T1CD",    levelId:"LV-02", subjectCode:"T",    subjectName:"Toán",               grades:["L1"],          publisher:"Cánh Diều",                       publishYear:2020, status:"active" },
  { id:"TB-TH-02", name:"Toán 1 - Kết nối tri thức",    code:"T1KN",    levelId:"LV-02", subjectCode:"T",    subjectName:"Toán",               grades:["L1"],          publisher:"Kết nối tri thức với cuộc sống",  publishYear:2020, status:"active" },
  { id:"TB-TH-03", name:"Toán 2 - Cánh Diều",           code:"T2CD",    levelId:"LV-02", subjectCode:"T",    subjectName:"Toán",               grades:["L2"],          publisher:"Cánh Diều",                       publishYear:2021, status:"active" },
  { id:"TB-TH-04", name:"Toán 3 - Kết nối tri thức",    code:"T3KN",    levelId:"LV-02", subjectCode:"T",    subjectName:"Toán",               grades:["L3"],          publisher:"Kết nối tri thức với cuộc sống",  publishYear:2022, status:"active" },
  { id:"TB-TH-05", name:"Tiếng Việt 1 - Cánh Diều",     code:"TV1CD",   levelId:"LV-02", subjectCode:"TV",   subjectName:"Tiếng Việt",         grades:["L1"],          publisher:"Cánh Diều",                       publishYear:2020, status:"active" },
  { id:"TB-TH-06", name:"Tiếng Việt 1 - Kết nối",       code:"TV1KN",   levelId:"LV-02", subjectCode:"TV",   subjectName:"Tiếng Việt",         grades:["L1"],          publisher:"Kết nối tri thức với cuộc sống",  publishYear:2020, status:"active" },
  { id:"TB-TH-07", name:"Tự nhiên & XH 1 - Kết nối",    code:"TNXH1KN", levelId:"LV-02", subjectCode:"TNXH", subjectName:"Tự nhiên & Xã hội",  grades:["L1"],          publisher:"Kết nối tri thức với cuộc sống",  publishYear:2020, status:"active" },
  { id:"TB-TH-08", name:"Khoa học 4 - Cánh Diều",       code:"KH4CD",   levelId:"LV-02", subjectCode:"KH",   subjectName:"Khoa học",           grades:["L4"],          publisher:"Cánh Diều",                       publishYear:2022, status:"hidden" },
  { id:"TB-CS-01", name:"Toán 6 - Kết nối tri thức",    code:"T6KN",    levelId:"LV-03", subjectCode:"T",    subjectName:"Toán",               grades:["L6"],          publisher:"Kết nối tri thức với cuộc sống",  publishYear:2021, status:"active" },
  { id:"TB-CS-02", name:"Toán 6 - Chân trời sáng tạo",  code:"T6CT",    levelId:"LV-03", subjectCode:"T",    subjectName:"Toán",               grades:["L6"],          publisher:"Chân trời sáng tạo",              publishYear:2021, status:"active" },
  { id:"TB-CS-03", name:"Ngữ văn 6 - Kết nối",          code:"NV6KN",   levelId:"LV-03", subjectCode:"NV",   subjectName:"Ngữ văn",            grades:["L6"],          publisher:"Kết nối tri thức với cuộc sống",  publishYear:2021, status:"active" },
  { id:"TB-CS-04", name:"Vật lý 7 - Cánh Diều",         code:"VL7CD",   levelId:"LV-03", subjectCode:"VL",   subjectName:"Vật lý",             grades:["L7"],          publisher:"Cánh Diều",                       publishYear:2022, status:"active" },
  { id:"TB-CS-05", name:"Hóa học 8 - Chân trời",        code:"HH8CT",   levelId:"LV-03", subjectCode:"HH",   subjectName:"Hóa học",            grades:["L8"],          publisher:"Chân trời sáng tạo",              publishYear:2022, status:"active" },
  { id:"TB-CS-06", name:"Sinh học 6 - Cánh Diều",       code:"SH6CD",   levelId:"LV-03", subjectCode:"SH",   subjectName:"Sinh học",           grades:["L6"],          publisher:"Cánh Diều",                       publishYear:2021, status:"active" },
  { id:"TB-CS-07", name:"Tiếng Anh 6 - Global Success", code:"TA6GS",   levelId:"LV-03", subjectCode:"TA",   subjectName:"Tiếng Anh",          grades:["L6"],          publisher:"NXB Giáo dục Việt Nam",           publishYear:2021, status:"active" },
  { id:"TB-PT-01", name:"Toán 10 - Cánh Diều",          code:"T10CD",   levelId:"LV-04", subjectCode:"T",    subjectName:"Toán",               grades:["L10"],         publisher:"Cánh Diều",                       publishYear:2022, status:"active" },
  { id:"TB-PT-02", name:"Toán 10 - Kết nối tri thức",   code:"T10KN",   levelId:"LV-04", subjectCode:"T",    subjectName:"Toán",               grades:["L10"],         publisher:"Kết nối tri thức với cuộc sống",  publishYear:2022, status:"active" },
  { id:"TB-PT-03", name:"Vật lý 10 - Cánh Diều",        code:"VL10CD",  levelId:"LV-04", subjectCode:"VL",   subjectName:"Vật lý",             grades:["L10"],         publisher:"Cánh Diều",                       publishYear:2022, status:"active" },
  { id:"TB-PT-04", name:"Hóa học 10 - Chân trời",       code:"HH10CT",  levelId:"LV-04", subjectCode:"HH",   subjectName:"Hóa học",            grades:["L10"],         publisher:"Chân trời sáng tạo",              publishYear:2022, status:"active" },
  { id:"TB-CD-01", name:"Giáo trình Toán ứng dụng",     code:"GTTU",    levelId:"LV-05", subjectCode:"TUD",  subjectName:"Toán ứng dụng",      grades:["N1"],          publisher:"NXB Đại học Sư phạm",             publishYear:2023, status:"active" },
];

/* ── Helpers ────────────────────────────────────────────── */

function autoCode(name: string) {
  return name.split(/\s+/).filter(Boolean)
    .map(w => w[0]?.toUpperCase() ?? "").join("")
    .replace(/[^A-Z0-9]/g, "").slice(0, 8)
    || name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeCode(v: string) { return v.toUpperCase().replace(/[^A-Z0-9_]/g, ""); }

function gradeLabel(grades: string[], levelId: string) {
  const list = GRADES_BY_LEVEL[levelId] ?? [];
  const names = grades.map(g => list.find(x => x.code === g)?.name ?? g);
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

function StatusBadge({ status }: { status: Textbook["status"] }) {
  return status === "active"
    ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Hiển thị</span>
    : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Ẩn</span>;
}

const IC = "px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 w-full";
const IE = "px-3 py-1.5 rounded-lg border border-red-400 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-300 w-full";

/* ── TextbookModal ──────────────────────────────────────── */

function makeInitModal(levelId: string, tb?: Textbook): ModalState {
  const firstSubject = SUBJECTS_BY_LEVEL[levelId]?.[0]?.code ?? "";
  return tb ? {
    name: tb.name, code: tb.code, codeEdited: true, codeError: "",
    levelId: tb.levelId, subjectCode: tb.subjectCode, grades: [...tb.grades],
    publisher: tb.publisher, publishYear: tb.publishYear, status: tb.status,
  } : {
    name: "", code: "", codeEdited: false, codeError: "",
    levelId, subjectCode: firstSubject, grades: [],
    publisher: PUBLISHERS[0], publishYear: new Date().getFullYear(), status: "active",
  };
}

function TextbookModal({
  editing, existingCodes, defaultLevelId, onSave, onClose,
}: {
  editing: Textbook | null;
  existingCodes: (excludeId?: string) => string[];
  defaultLevelId: string;
  onSave: (data: Omit<Textbook, "id">) => void;
  onClose: () => void;
}) {
  const [s, setS] = useState<ModalState>(() => makeInitModal(defaultLevelId, editing ?? undefined));

  const subjects = SUBJECTS_BY_LEVEL[s.levelId] ?? [];
  const gradeList = GRADES_BY_LEVEL[s.levelId] ?? [];

  const patch = (p: Partial<ModalState>) => setS(prev => ({ ...prev, ...p }));

  const handleLevelChange = (levelId: string) => {
    const firstSub = SUBJECTS_BY_LEVEL[levelId]?.[0]?.code ?? "";
    patch({ levelId, subjectCode: firstSub, grades: [] });
  };

  const handleNameChange = (name: string) => {
    patch({ name, ...(s.codeEdited ? {} : { code: normalizeCode(autoCode(name)) }) });
  };

  const toggleGrade = (code: string) => {
    patch({ grades: s.grades.includes(code) ? s.grades.filter(g => g !== code) : [...s.grades, code] });
  };

  const handleSave = () => {
    if (!s.name.trim() || !s.code.trim()) return;
    const codes = existingCodes(editing?.id);
    if (codes.includes(s.code)) { patch({ codeError: "Mã đã tồn tại" }); return; }
    const subjectName = subjects.find(x => x.code === s.subjectCode)?.name ?? s.subjectCode;
    onSave({ name: s.name.trim(), code: s.code, levelId: s.levelId, subjectCode: s.subjectCode, subjectName, grades: s.grades, publisher: s.publisher.trim(), publishYear: s.publishYear, status: s.status });
  };

  const canSave = s.name.trim() && s.code.trim() && s.subjectCode && s.grades.length > 0 && s.publisher.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold">{editing ? "Chỉnh sửa sách giáo khoa" : "Thêm sách giáo khoa"}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Tên sách */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên sách <span className="text-red-500">*</span></label>
            <input value={s.name} onChange={e => handleNameChange(e.target.value)} className={IC} placeholder="VD: Toán 1 - Cánh Diều" />
          </div>

          {/* Mã sách */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã sách <span className="text-red-500">*</span></label>
            <input value={s.code}
              onChange={e => patch({ code: normalizeCode(e.target.value), codeEdited: true, codeError: "" })}
              className={s.codeError ? IE : IC} placeholder="VD: T1CD" />
            {s.codeError && <p className="text-xs text-red-500 mt-1">{s.codeError}</p>}
          </div>

          {/* Cấp học + Môn học */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Cấp học <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={s.levelId} onChange={e => handleLevelChange(e.target.value)}
                  className="pl-3 pr-8 py-1.5 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 w-full cursor-pointer">
                  {LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Môn học <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={s.subjectCode} onChange={e => patch({ subjectCode: e.target.value })}
                  className="pl-3 pr-8 py-1.5 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 w-full cursor-pointer">
                  {subjects.map(sub => <option key={sub.code} value={sub.code}>{sub.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Khối / Lớp áp dụng */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Khối / Lớp áp dụng <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-muted-foreground ml-1">(chọn một hoặc nhiều)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {gradeList.map(g => (
                <label key={g.code} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors select-none ${s.grades.includes(g.code) ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-muted"}`}>
                  <input type="checkbox" checked={s.grades.includes(g.code)} onChange={() => toggleGrade(g.code)} className="hidden" />
                  {s.grades.includes(g.code) && <Check size={12} />}
                  {g.name}
                </label>
              ))}
            </div>
            {gradeList.length === 0 && <p className="text-xs text-muted-foreground">Không có khối học cho cấp này.</p>}
          </div>

          {/* NXB + Năm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nhà xuất bản <span className="text-red-500">*</span></label>
              <input list="publishers-list" value={s.publisher} onChange={e => patch({ publisher: e.target.value })}
                className={IC} placeholder="Nhập hoặc chọn NXB" />
              <datalist id="publishers-list">
                {PUBLISHERS.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Năm xuất bản</label>
              <input type="number" min={2000} max={2099} value={s.publishYear}
                onChange={e => patch({ publishYear: parseInt(e.target.value) || new Date().getFullYear() })}
                className={IC} />
            </div>
          </div>

          {/* Trạng thái (chỉ khi edit) */}
          {editing && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="text-sm font-medium">Trạng thái</p>
                <p className="text-xs text-muted-foreground">{s.status === "active" ? "Sách đang hiển thị trong hệ thống" : "Sách đang bị ẩn"}</p>
              </div>
              <button
                type="button"
                onClick={() => patch({ status: s.status === "active" ? "hidden" : "active" })}
                className={`relative w-10 h-5 rounded-full transition-colors ${s.status === "active" ? "bg-primary" : "bg-border"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${s.status === "active" ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Huỷ</button>
          <button onClick={handleSave} disabled={!canSave}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {editing ? "Lưu thay đổi" : "Thêm sách"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── HideModal ──────────────────────────────────────────── */

function HideModal({ tb, onConfirm, onClose }: { tb: Textbook; onConfirm: () => void; onClose: () => void }) {
  const isHiding = tb.status === "active";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-base font-semibold">{isHiding ? "Ẩn sách giáo khoa?" : "Hiển thị lại sách?"}</h2>
            <p className="text-sm text-muted-foreground mt-0.5"><strong>{tb.name}</strong></p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {isHiding ? "Sách sẽ không hiển thị để NCC và GV lựa chọn khi tạo chương trình mới." : "Sách sẽ hiển thị trở lại trong toàn bộ hệ thống."}
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Huỷ</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isHiding ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
            {isHiding ? "Ẩn" : "Hiển thị lại"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

export function TextbookAdmin() {
  const [textbooks, setTextbooks]         = useState<Textbook[]>(INITIAL_TEXTBOOKS);
  const [selectedLevel, setSelectedLevel] = useState("LV-01");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter]   = useState<"all" | "active" | "hidden">("all");
  const [search, setSearch]               = useState("");
  const [modalTarget, setModalTarget]     = useState<Textbook | "new" | null>(null);
  const [hideTarget, setHideTarget]       = useState<Textbook | null>(null);

  const existingCodes = (excludeId?: string) =>
    textbooks.filter(t => t.id !== excludeId).map(t => t.code);

  const handleLevelChange = (id: string) => {
    setSelectedLevel(id);
    setSubjectFilter("all");
    setSearch("");
  };

  const filtered = textbooks
    .filter(t => t.levelId === selectedLevel)
    .filter(t => subjectFilter === "all" || t.subjectCode === subjectFilter)
    .filter(t => statusFilter === "all" || t.status === statusFilter)
    .filter(t => !search.trim() || t.name.toLowerCase().includes(search.trim().toLowerCase()));

  const hasFilter = subjectFilter !== "all" || statusFilter !== "all" || search.trim().length > 0;
  const levelName = LEVELS.find(l => l.id === selectedLevel)?.name ?? "";
  const levelSubjects = SUBJECTS_BY_LEVEL[selectedLevel] ?? [];

  const handleSave = (data: Omit<Textbook, "id">) => {
    if (modalTarget === "new") {
      const tb: Textbook = { id: `TB-${Date.now()}`, ...data };
      setTextbooks(prev => [tb, ...prev]);
      toast.success(`Đã thêm "${data.name}"`);
    } else if (modalTarget) {
      setTextbooks(prev => prev.map(t => t.id === modalTarget.id ? { ...t, ...data } : t));
      toast.success(`Đã cập nhật "${data.name}"`);
    }
    setModalTarget(null);
  };

  const handleHideConfirm = () => {
    if (!hideTarget) return;
    const newStatus = hideTarget.status === "active" ? "hidden" : "active";
    setTextbooks(prev => prev.map(t => t.id === hideTarget.id ? { ...t, status: newStatus } : t));
    newStatus === "hidden"
      ? toast.info(`Đã ẩn "${hideTarget.name}"`)
      : toast.success(`Đã hiển thị lại "${hideTarget.name}"`);
    setHideTarget(null);
  };

  return (
    <>
      {modalTarget !== null && (
        <TextbookModal
          editing={modalTarget === "new" ? null : modalTarget}
          existingCodes={existingCodes}
          defaultLevelId={selectedLevel}
          onSave={handleSave}
          onClose={() => setModalTarget(null)}
        />
      )}
      {hideTarget && <HideModal tb={hideTarget} onConfirm={handleHideConfirm} onClose={() => setHideTarget(null)} />}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Danh mục Sách giáo khoa</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Quản lý danh mục sách giáo khoa theo cấp học và môn học.</p>
          </div>
          <button
            onClick={() => setModalTarget("new")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
            <Plus size={15} /> Thêm sách
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Cấp học */}
          <div className="relative">
            <select value={selectedLevel} onChange={e => handleLevelChange(e.target.value)}
              className="pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer">
              {LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          {/* Môn học */}
          <div className="relative">
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
              className="pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer">
              <option value="all">Tất cả môn học</option>
              {levelSubjects.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          {/* Trạng thái */}
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hiển thị</option>
              <option value="hidden">Ẩn</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên sách..."
              className="pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-sm w-52 focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          {hasFilter && (
            <button onClick={() => { setSubjectFilter("all"); setStatusFilter("all"); setSearch(""); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors text-muted-foreground">
              <X size={13} /> Xoá bộ lọc
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-sm font-medium text-muted-foreground">
              {filtered.length} sách giáo khoa · {levelName}
              {hasFilter && <span className="ml-1 text-amber-600 dark:text-amber-400">(đang lọc)</span>}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-12">STT</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Tên sách</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Mã sách</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-36">Môn học</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-36">Lớp / Khối</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-44">NXB</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-muted-foreground w-20">Năm XB</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Trạng thái</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tb, idx) => (
                  <tr key={tb.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-sm">{tb.name}</td>
                    <td className="py-3 px-4">
                      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{tb.code}</code>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{tb.subjectName}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{gradeLabel(tb.grades, tb.levelId)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground truncate max-w-[176px]" title={tb.publisher}>{tb.publisher}</td>
                    <td className="py-3 px-4 text-sm text-center">{tb.publishYear}</td>
                    <td className="py-3 px-4"><StatusBadge status={tb.status} /></td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModalTarget(tb)}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Chỉnh sửa">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setHideTarget(tb)}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title={tb.status === "active" ? "Ẩn" : "Hiển thị lại"}>
                          {tb.status === "active" ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                      Không tìm thấy sách giáo khoa nào{hasFilter ? " phù hợp với bộ lọc" : ""}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
