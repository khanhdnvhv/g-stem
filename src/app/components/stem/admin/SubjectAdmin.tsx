import { useState, useRef } from "react";
import {
  Pencil, EyeOff, Eye, Check, X, AlertTriangle,
  Upload, FileSpreadsheet, Download, Search, ChevronDown, Plus,
} from "lucide-react";
import { toast } from "sonner";

/* ── Types ─────────────────────────────────────────────── */

interface Subject {
  id: string;
  levelId: string;
  name: string;
  code: string;
  type: "required" | "elective";
  stemCount: number;
  status: "active" | "hidden";
  createdAt: string;
}
interface EditState { name: string; code: string; type: "required" | "elective"; codeError: string; }
interface AddState extends EditState { codeEdited: boolean; }
interface ImportRow { name: string; code: string; type: string; error?: string; }

/* ── Mock data ──────────────────────────────────────────── */

const LEVELS = [
  { id: "LV-01", name: "Mầm non" },
  { id: "LV-02", name: "Tiểu học" },
  { id: "LV-03", name: "Trung học cơ sở" },
  { id: "LV-04", name: "Trung học phổ thông" },
  { id: "LV-05", name: "Cao đẳng / Nghề" },
  { id: "LV-06", name: "Đại học" },
];

const INITIAL_SUBJECTS: Subject[] = [
  { id: "S-MN-01", levelId: "LV-01", name: "Khám phá khoa học",    code: "KHKH", type: "required", stemCount: 2,  status: "active", createdAt: "2024-01-10" },
  { id: "S-MN-02", levelId: "LV-01", name: "Hoạt động tạo hình",   code: "HDTH", type: "required", stemCount: 3,  status: "active", createdAt: "2024-01-10" },
  { id: "S-MN-03", levelId: "LV-01", name: "Âm nhạc",              code: "AN",   type: "elective", stemCount: 1,  status: "active", createdAt: "2024-01-10" },
  { id: "S-MN-04", levelId: "LV-01", name: "Giáo dục thể chất",    code: "GDTC", type: "required", stemCount: 0,  status: "active", createdAt: "2024-01-10" },
  { id: "S-MN-05", levelId: "LV-01", name: "Phát triển ngôn ngữ",  code: "PTNN", type: "required", stemCount: 2,  status: "active", createdAt: "2024-01-10" },
  { id: "S-TH-01", levelId: "LV-02", name: "Toán",                 code: "T",    type: "required", stemCount: 15, status: "active", createdAt: "2024-01-10" },
  { id: "S-TH-02", levelId: "LV-02", name: "Tiếng Việt",           code: "TV",   type: "required", stemCount: 12, status: "active", createdAt: "2024-01-10" },
  { id: "S-TH-03", levelId: "LV-02", name: "Đạo đức",              code: "DD",   type: "required", stemCount: 0,  status: "active", createdAt: "2024-01-10" },
  { id: "S-TH-04", levelId: "LV-02", name: "Tự nhiên & Xã hội",   code: "TNXH", type: "required", stemCount: 8,  status: "active", createdAt: "2024-01-10" },
  { id: "S-TH-05", levelId: "LV-02", name: "Khoa học",             code: "KH",   type: "required", stemCount: 10, status: "active", createdAt: "2024-01-10" },
  { id: "S-TH-06", levelId: "LV-02", name: "Tin học",              code: "THTL", type: "elective", stemCount: 6,  status: "active", createdAt: "2024-01-10" },
  { id: "S-TH-07", levelId: "LV-02", name: "Âm nhạc",              code: "AN",   type: "elective", stemCount: 2,  status: "active", createdAt: "2024-01-10" },
  { id: "S-TH-08", levelId: "LV-02", name: "Mĩ thuật",             code: "MT",   type: "elective", stemCount: 3,  status: "active", createdAt: "2024-01-10" },
  { id: "S-TH-09", levelId: "LV-02", name: "Giáo dục thể chất",    code: "GDTC", type: "required", stemCount: 0,  status: "active", createdAt: "2024-01-10" },
  { id: "S-TH-10", levelId: "LV-02", name: "Tiếng Anh",            code: "TA",   type: "required", stemCount: 9,  status: "hidden", createdAt: "2024-01-10" },
  { id: "S-CS-01", levelId: "LV-03", name: "Toán",                 code: "T",    type: "required", stemCount: 18, status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-02", levelId: "LV-03", name: "Ngữ văn",              code: "NV",   type: "required", stemCount: 5,  status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-03", levelId: "LV-03", name: "Vật lý",               code: "VL",   type: "required", stemCount: 14, status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-04", levelId: "LV-03", name: "Hóa học",              code: "HH",   type: "required", stemCount: 12, status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-05", levelId: "LV-03", name: "Sinh học",             code: "SH",   type: "required", stemCount: 10, status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-06", levelId: "LV-03", name: "Lịch sử",              code: "LS",   type: "required", stemCount: 3,  status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-07", levelId: "LV-03", name: "Địa lý",               code: "DL",   type: "required", stemCount: 4,  status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-08", levelId: "LV-03", name: "Tiếng Anh",            code: "TA",   type: "required", stemCount: 8,  status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-09", levelId: "LV-03", name: "Công nghệ",            code: "CN",   type: "elective", stemCount: 6,  status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-10", levelId: "LV-03", name: "Tin học",              code: "TH",   type: "elective", stemCount: 9,  status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-11", levelId: "LV-03", name: "Âm nhạc",              code: "AN",   type: "elective", stemCount: 1,  status: "active", createdAt: "2024-01-10" },
  { id: "S-CS-12", levelId: "LV-03", name: "GDCD",                 code: "GDCD", type: "required", stemCount: 0,  status: "active", createdAt: "2024-01-10" },
  { id: "S-PT-01", levelId: "LV-04", name: "Toán",                 code: "T",    type: "required", stemCount: 12, status: "active", createdAt: "2024-01-10" },
  { id: "S-PT-02", levelId: "LV-04", name: "Ngữ văn",              code: "NV",   type: "required", stemCount: 4,  status: "active", createdAt: "2024-01-10" },
  { id: "S-PT-03", levelId: "LV-04", name: "Tiếng Anh",            code: "TA",   type: "required", stemCount: 7,  status: "active", createdAt: "2024-01-10" },
  { id: "S-PT-04", levelId: "LV-04", name: "Vật lý",               code: "VL",   type: "elective", stemCount: 9,  status: "active", createdAt: "2024-01-10" },
  { id: "S-PT-05", levelId: "LV-04", name: "Hóa học",              code: "HH",   type: "elective", stemCount: 8,  status: "active", createdAt: "2024-01-10" },
  { id: "S-PT-06", levelId: "LV-04", name: "Sinh học",             code: "SH",   type: "elective", stemCount: 7,  status: "active", createdAt: "2024-01-10" },
  { id: "S-PT-07", levelId: "LV-04", name: "Công nghệ",            code: "CN",   type: "elective", stemCount: 5,  status: "active", createdAt: "2024-01-10" },
  { id: "S-PT-08", levelId: "LV-04", name: "Tin học",              code: "TH",   type: "elective", stemCount: 8,  status: "active", createdAt: "2024-01-10" },
  { id: "S-PT-09", levelId: "LV-04", name: "GDCD",                 code: "GDCD", type: "required", stemCount: 0,  status: "active", createdAt: "2024-01-10" },
  { id: "S-PT-10", levelId: "LV-04", name: "Giáo dục QP&AN",       code: "GDQP", type: "required", stemCount: 0,  status: "active", createdAt: "2024-01-10" },
  { id: "S-CD-01", levelId: "LV-05", name: "Toán ứng dụng",        code: "TUD",  type: "required", stemCount: 2,  status: "active", createdAt: "2024-03-15" },
  { id: "S-CD-02", levelId: "LV-05", name: "Tiếng Anh kỹ thuật",   code: "TAKT", type: "required", stemCount: 1,  status: "active", createdAt: "2024-03-15" },
  { id: "S-CD-03", levelId: "LV-05", name: "Lập trình cơ bản",     code: "LTC",  type: "elective", stemCount: 3,  status: "active", createdAt: "2024-03-15" },
  { id: "S-DH-01", levelId: "LV-06", name: "Toán cao cấp",         code: "TCC",  type: "required", stemCount: 0,  status: "active", createdAt: "2024-03-15" },
  { id: "S-DH-02", levelId: "LV-06", name: "Triết học Mác-Lênin",  code: "THML", type: "required", stemCount: 0,  status: "active", createdAt: "2024-03-15" },
];

const MOCK_IMPORT_PREVIEW: ImportRow[] = [
  { name: "Khoa học máy tính", code: "KHMT", type: "Tự chọn" },
  { name: "Robotics cơ bản",   code: "ROB",  type: "Tự chọn" },
  { name: "",                   code: "ERR",  type: "Bắt buộc", error: "Tên môn học không được để trống" },
  { name: "Toán",               code: "T",    type: "Bắt buộc", error: "Mã 'T' đã tồn tại trong cấp học" },
  { name: "STEAM Art",          code: "SA",   type: "Tự chọn" },
];

/* ── Helpers ────────────────────────────────────────────── */

function autoCode(name: string): string {
  return name.split(/[\s&]+/).filter(Boolean)
    .map(w => w[0]?.toUpperCase() ?? "").join("")
    .replace(/[^A-Z0-9]/g, "").slice(0, 6)
    || name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeCode(v: string) { return v.toUpperCase().replace(/[^A-Z0-9_]/g, ""); }

function StatusBadge({ status }: { status: Subject["status"] }) {
  return status === "active"
    ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Hiển thị</span>
    : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Ẩn</span>;
}

function TypeBadge({ type }: { type: Subject["type"] }) {
  return type === "required"
    ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Bắt buộc</span>
    : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Tự chọn</span>;
}

const IC = "px-2 py-1 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
const IE = "px-2 py-1 rounded border border-red-400 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-300";

function TypeRadio({ value, onChange }: { value: "required" | "elective"; onChange: (v: "required" | "elective") => void }) {
  return (
    <div className="flex flex-col gap-1">
      {(["required", "elective"] as const).map(t => (
        <label key={t} className="flex items-center gap-1.5 text-xs cursor-pointer whitespace-nowrap">
          <input type="radio" name={`type-${Math.random()}`} checked={value === t} onChange={() => onChange(t)} className="accent-primary" />
          {t === "required" ? "Bắt buộc" : "Tự chọn"}
        </label>
      ))}
    </div>
  );
}

/* ── SubjectRow ─────────────────────────────────────────── */

function SubjectRow({
  subject, stt, isEditing, editState,
  onEditChange, onSaveEdit, onCancelEdit, onStartEdit, onToggleHide,
}: {
  subject: Subject; stt: number; isEditing: boolean; editState: EditState;
  onEditChange: (p: Partial<EditState>) => void;
  onSaveEdit: () => void; onCancelEdit: () => void;
  onStartEdit: () => void; onToggleHide: () => void;
}) {
  if (isEditing) {
    return (
      <tr className="border-b border-border bg-blue-50/40 dark:bg-blue-950/20">
        <td className="py-2 px-4 text-sm text-muted-foreground">{stt}</td>
        <td className="py-2 px-2">
          <input value={editState.name} onChange={e => onEditChange({ name: e.target.value })}
            className={`w-full ${IC}`} placeholder="Tên môn học *" />
        </td>
        <td className="py-2 px-2">
          <input value={editState.code} onChange={e => onEditChange({ code: normalizeCode(e.target.value), codeError: "" })}
            className={`w-24 font-mono ${editState.codeError ? IE : IC}`} placeholder="Mã *" />
          {editState.codeError && <p className="text-xs text-red-500 mt-0.5">{editState.codeError}</p>}
        </td>
        <td className="py-2 px-4"><StatusBadge status={subject.status} /></td>
        <td className="py-2 px-4 text-xs text-muted-foreground">{subject.createdAt}</td>
        <td className="py-2 px-3">
          <div className="flex items-center gap-1">
            <button onClick={onSaveEdit} disabled={!editState.name.trim() || !editState.code.trim()}
              className="p-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors" title="Lưu">
              <Check size={13} />
            </button>
            <button onClick={onCancelEdit}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground" title="Huỷ">
              <X size={13} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4 text-sm text-muted-foreground">{stt}</td>
      <td className="py-3 px-4 font-medium text-sm">{subject.name}</td>
      <td className="py-3 px-4"><code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{subject.code}</code></td>
      <td className="py-3 px-4"><StatusBadge status={subject.status} /></td>
      <td className="py-3 px-4 text-xs text-muted-foreground">{subject.createdAt}</td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1">
          <button onClick={onStartEdit}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Chỉnh sửa">
            <Pencil size={14} />
          </button>
          <button onClick={onToggleHide}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={subject.status === "active" ? "Ẩn" : "Hiển thị lại"}>
            {subject.status === "active" ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── HideModal ──────────────────────────────────────────── */

function HideModal({ subject, onConfirm, onClose }: { subject: Subject; onConfirm: () => void; onClose: () => void }) {
  if (subject.status === "hidden") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
          <h2 className="text-base font-semibold mb-2">Hiển thị lại môn học?</h2>
          <p className="text-sm text-muted-foreground mb-4"><strong>{subject.name}</strong> sẽ hiển thị trở lại trong hệ thống.</p>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Huỷ</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Hiển thị lại</button>
          </div>
        </div>
      </div>
    );
  }

  const hasRefs = subject.stemCount > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-base font-semibold">Ẩn môn học?</h2>
            <p className="text-sm text-muted-foreground mt-0.5"><strong>{subject.name}</strong></p>
          </div>
        </div>
        {hasRefs ? (
          <>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 mb-4 text-sm text-red-800 dark:text-red-300">
              Môn học này đang được tham chiếu trong <strong>{subject.stemCount} chương trình STEM</strong>. Yêu cầu NCC cập nhật các chương trình liên quan trước khi ẩn.
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Đóng</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">Môn học này chưa được tham chiếu bởi chương trình STEM nào. Bạn có thể ẩn ngay.</p>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Huỷ</button>
              <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors">Ẩn</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── ExcelImportModal ───────────────────────────────────── */

function ExcelImportModal({ levelName, onImport, onClose }: {
  levelName: string;
  onImport: (rows: ImportRow[]) => void;
  onClose: () => void;
}) {
  const [file, setFile]           = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const validRows  = MOCK_IMPORT_PREVIEW.filter(r => !r.error);
  const errorCount = MOCK_IMPORT_PREVIEW.filter(r => !!r.error).length;

  const acceptFile = (f: File) => setFile(f);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold">Nhập môn học từ Excel — {levelName}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Template download */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
            <FileSpreadsheet size={20} className="text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">File mẫu Excel</p>
              <p className="text-xs text-muted-foreground">Cột: Tên môn, Mã môn, Loại (Bắt buộc / Tự chọn)</p>
            </div>
            <button
              onClick={() => toast.success("Đang tải file mẫu danh sách môn học...")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors shrink-0">
              <Download size={14} /> Tải file mẫu
            </button>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) acceptFile(f); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/20"}`}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) acceptFile(f); }} />
            <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
            {file ? (
              <p className="text-sm font-medium text-green-600 dark:text-green-400">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium">Kéo thả file vào đây hoặc click để chọn</p>
                <p className="text-xs text-muted-foreground mt-1">Hỗ trợ .xlsx, .xls, .csv · Tối đa 5 MB</p>
              </>
            )}
          </div>

          {/* Preview */}
          {file && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Xem trước ({MOCK_IMPORT_PREVIEW.length} dòng)</p>
                {errorCount > 0 && (
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">{errorCount} dòng lỗi · {validRows.length} hợp lệ</span>
                )}
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground w-10">#</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Tên môn</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground w-24">Mã môn</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground w-24">Loại</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_IMPORT_PREVIEW.map((row, i) => (
                      <tr key={i} className={`border-b border-border last:border-0 ${row.error ? "bg-red-50 dark:bg-red-900/20" : "hover:bg-muted/20"}`}>
                        <td className="py-2 px-3 text-xs text-muted-foreground">{i + 1}</td>
                        <td className={`py-2 px-3 text-sm ${row.error ? "text-red-800 dark:text-red-300" : ""}`}>
                          {row.name || <span className="italic text-muted-foreground">(trống)</span>}
                        </td>
                        <td className={`py-2 px-3 text-sm font-mono ${row.error ? "text-red-800 dark:text-red-300" : ""}`}>{row.code}</td>
                        <td className="py-2 px-3 text-sm">{row.type}</td>
                        <td className="py-2 px-3">
                          {row.error
                            ? <span className="text-xs text-red-600 dark:text-red-400">{row.error}</span>
                            : <span className="text-xs text-green-600 dark:text-green-400">Hợp lệ</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground">
            {file ? `Sẽ import ${validRows.length} / ${MOCK_IMPORT_PREVIEW.length} dòng hợp lệ` : "Chưa chọn file"}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Huỷ</button>
            <button
              disabled={!file || validRows.length === 0}
              onClick={() => { onImport(validRows); onClose(); toast.success(`Đã import ${validRows.length} môn học vào ${levelName}`); }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận import ({file ? validRows.length : 0})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

export function SubjectAdmin() {
  const [subjects, setSubjects]     = useState<Subject[]>(INITIAL_SUBJECTS);
  const [selectedLevel, setSelectedLevel] = useState("LV-01");
  const [statusFilter, setStatusFilter]   = useState<"all" | "active" | "hidden">("all");
  const [search, setSearch]               = useState("");

  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editState, setEditState]   = useState<EditState>({ name: "", code: "", type: "required", codeError: "" });

  const [isAdding, setIsAdding]     = useState(false);
  const [addState, setAddState]     = useState<AddState>({ name: "", code: "", type: "required", codeError: "", codeEdited: false });

  const [hideTarget, setHideTarget] = useState<Subject | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const levelName  = LEVELS.find(l => l.id === selectedLevel)?.name ?? "";
  const levelCodes = (excludeId?: string) =>
    subjects.filter(s => s.levelId === selectedLevel && s.id !== excludeId).map(s => s.code);

  const filtered = subjects
    .filter(s => s.levelId === selectedLevel)
    .filter(s => statusFilter === "all" || s.status === statusFilter)
    .filter(s => !search.trim() || s.name.toLowerCase().includes(search.trim().toLowerCase()));

  const hasFilter = statusFilter !== "all" || search.trim().length > 0;

  const handleLevelChange = (id: string) => {
    setEditingId(null);
    setIsAdding(false);
    setSelectedLevel(id);
    setStatusFilter("all");
    setSearch("");
  };

  const handleStartEdit = (subject: Subject) => {
    setIsAdding(false);
    setEditingId(subject.id);
    setEditState({ name: subject.name, code: subject.code, type: subject.type, codeError: "" });
  };

  const handleSaveEdit = () => {
    if (!editState.name.trim() || !editState.code.trim()) return;
    if (levelCodes(editingId!).includes(editState.code)) {
      setEditState(s => ({ ...s, codeError: "Mã đã tồn tại trong cấp học này" }));
      return;
    }
    setSubjects(prev => prev.map(s => s.id === editingId
      ? { ...s, name: editState.name.trim(), code: editState.code, type: editState.type }
      : s));
    toast.success(`Đã cập nhật "${editState.name}"`);
    setEditingId(null);
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setAddState({ name: "", code: "", type: "required", codeError: "", codeEdited: false });
    setIsAdding(true);
  };

  const handleAddNameChange = (name: string) => {
    setAddState(s => ({
      ...s, name,
      code: s.codeEdited ? s.code : normalizeCode(autoCode(name)),
      codeError: "",
    }));
  };

  const handleSaveAdd = () => {
    if (!addState.name.trim() || !addState.code.trim()) return;
    if (levelCodes().includes(addState.code)) {
      setAddState(s => ({ ...s, codeError: "Mã đã tồn tại trong cấp học này" }));
      return;
    }
    const newSubject: Subject = {
      id: `S-${Date.now()}`,
      levelId: selectedLevel,
      name: addState.name.trim(),
      code: addState.code,
      type: addState.type,
      stemCount: 0,
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setSubjects(prev => [newSubject, ...prev]);
    toast.success(`Đã thêm môn học "${newSubject.name}"`);
    setIsAdding(false);
  };

  const handleHideConfirm = () => {
    if (!hideTarget) return;
    const newStatus = hideTarget.status === "active" ? "hidden" : "active";
    setSubjects(prev => prev.map(s => s.id === hideTarget.id ? { ...s, status: newStatus } : s));
    newStatus === "hidden"
      ? toast.info(`Đã ẩn "${hideTarget.name}"`)
      : toast.success(`Đã hiển thị lại "${hideTarget.name}"`);
    setHideTarget(null);
  };

  const handleImport = (rows: ImportRow[]) => {
    const newSubjects: Subject[] = rows.map((r, i) => ({
      id: `S-IMP-${Date.now()}-${i}`,
      levelId: selectedLevel,
      name: r.name,
      code: r.code,
      type: r.type === "Bắt buộc" ? "required" : "elective",
      stemCount: 0,
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    }));
    setSubjects(prev => [...newSubjects, ...prev]);
  };

  const clearFilters = () => { setStatusFilter("all"); setSearch(""); };

  return (
    <>
      {importOpen && <ExcelImportModal levelName={levelName} onImport={handleImport} onClose={() => setImportOpen(false)} />}
      {hideTarget && <HideModal subject={hideTarget} onConfirm={handleHideConfirm} onClose={() => setHideTarget(null)} />}

      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Khai báo Môn học</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Quản lý danh sách môn học theo từng cấp học.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
              <Upload size={15} /> Nhập từ Excel
            </button>
            <button
              onClick={handleStartAdd}
              disabled={isAdding}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus size={15} /> Thêm môn học
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select value={selectedLevel} onChange={e => handleLevelChange(e.target.value)}
              className="pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer">
              {LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hiển thị</option>
              <option value="hidden">Ẩn</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên môn học..."
              className="pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-sm w-52 focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          {hasFilter && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors text-muted-foreground">
              <X size={13} /> Xoá bộ lọc
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-sm font-medium text-muted-foreground">
              {filtered.length} môn học · {levelName}
              {hasFilter && <span className="ml-1 text-amber-600 dark:text-amber-400">(đang lọc)</span>}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-14">STT</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Tên môn học</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Mã môn</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Trạng thái</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Ngày tạo</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {/* Inline add row at TOP */}
              {isAdding && (
                <tr className="border-b border-border bg-green-50/30 dark:bg-green-950/20">
                  <td className="py-2 px-4 text-sm text-muted-foreground">—</td>
                  <td className="py-2 px-2">
                    <input value={addState.name} onChange={e => handleAddNameChange(e.target.value)}
                      className={`w-full ${IC}`} placeholder="Tên môn học *" autoFocus />
                  </td>
                  <td className="py-2 px-2">
                    <input value={addState.code}
                      onChange={e => setAddState(s => ({ ...s, code: normalizeCode(e.target.value), codeError: "", codeEdited: true }))}
                      className={`w-24 font-mono ${addState.codeError ? IE : IC}`} placeholder="Mã *" />
                    {addState.codeError && <p className="text-xs text-red-500 mt-0.5">{addState.codeError}</p>}
                  </td>
                  <td className="py-2 px-4">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Hiển thị</span>
                  </td>
                  <td className="py-2 px-4 text-xs text-muted-foreground">{new Date().toISOString().slice(0, 10)}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      <button onClick={handleSaveAdd} disabled={!addState.name.trim() || !addState.code.trim()}
                        className="p-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors" title="Lưu">
                        <Check size={13} />
                      </button>
                      <button onClick={() => setIsAdding(false)}
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground" title="Huỷ">
                        <X size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {filtered.map((subject, idx) => (
                <SubjectRow
                  key={subject.id}
                  subject={subject}
                  stt={idx + 1}
                  isEditing={editingId === subject.id}
                  editState={editState}
                  onEditChange={p => setEditState(s => ({ ...s, ...p }))}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onStartEdit={() => handleStartEdit(subject)}
                  onToggleHide={() => setHideTarget(subject)}
                />
              ))}

              {filtered.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    Không tìm thấy môn học nào{hasFilter ? " phù hợp với bộ lọc" : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
