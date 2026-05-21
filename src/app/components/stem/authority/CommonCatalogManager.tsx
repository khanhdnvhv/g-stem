import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Layers, Plus, Search, Pencil, Trash2, Download, Upload,
  BookOpen, GraduationCap, School as SchoolIcon, Target,
  ChevronRight, ArrowLeft, X, Check, FileJson, FileText, ChevronDown,
  AlertCircle, FileDown, Eye,
} from "lucide-react";
import { catalogs } from "./authority-data";
import type { CatalogItem } from "./authority-data";
import { PageHeader } from "./authority-ui";
import { toast } from "sonner";

/* ================================================================ */
/*  TYPES & CONFIG                                                   */
/* ================================================================ */

type CatalogKey = CatalogItem["catalog"];

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: string[];
  dynamicCatalog?: CatalogKey; // options loaded from another catalog
  required?: boolean;
}

interface CatalogConfig {
  label: string;
  color: string;
  icon: typeof BookOpen;
  description: string;
  codePrefix: string;
  fields: FieldDef[];         // extra metadata fields
  columns: { key: string; label: string; width?: string }[];
}

const CATALOG_CONFIG: Record<CatalogKey, CatalogConfig> = {
  subject: {
    label: "Môn học", color: "#2563eb", icon: BookOpen, codePrefix: "SUB",
    description: "Danh sách môn học chuẩn hóa theo chương trình giáo dục quốc gia, dùng chung trong toàn hệ thống.",
    fields: [
      { key: "nhomMon", label: "Nhóm môn", type: "select", required: true,
        dynamicCatalog: "subjectGroup" },
    ],
    columns: [
      { key: "code",    label: "Mã",       width: "w-28" },
      { key: "name",    label: "Tên môn học" },
      { key: "nhomMon", label: "Nhóm môn", width: "w-36" },
    ],
  },
  grade: {
    label: "Cấp học", color: "#7c3aed", icon: GraduationCap, codePrefix: "GRD",
    description: "Các cấp học từ Mầm non đến THPT và Đại học, làm cơ sở phân loại học sinh và chương trình.",
    fields: [
      { key: "soNam",   label: "Số năm học", type: "text", placeholder: "VD: 5" },
      { key: "lopTuDen", label: "Lớp từ – đến", type: "text", placeholder: "VD: 1–5" },
    ],
    columns: [
      { key: "code",    label: "Mã",         width: "w-28" },
      { key: "name",    label: "Tên cấp học" },
      { key: "lopTuDen", label: "Lớp",       width: "w-28" },
      { key: "soNam",   label: "Số năm",     width: "w-24" },
    ],
  },
  school: {
    label: "Trường học", color: "#c8a84e", icon: SchoolIcon, codePrefix: "SCH",
    description: "Danh sách trường học đã đăng ký và được cấp phép hoạt động trên nền tảng Geleximco STEM.",
    fields: [
      { key: "loaiHinh", label: "Loại hình", type: "select", required: true,
        options: ["Công lập", "Tư thục", "Quốc tế", "Liên kết"] },
      { key: "capHoc",   label: "Cấp học",   type: "select",
        options: ["Tiểu học", "THCS", "THPT", "Tiểu học & THCS", "THCS & THPT", "K–12"] },
      { key: "tinhThanh", label: "Tỉnh / Thành phố", type: "text", placeholder: "VD: Hà Nội" },
    ],
    columns: [
      { key: "code",     label: "Mã",           width: "w-28" },
      { key: "name",     label: "Tên trường" },
      { key: "loaiHinh", label: "Loại hình",    width: "w-28" },
      { key: "capHoc",   label: "Cấp học",      width: "w-36" },
      { key: "tinhThanh", label: "Tỉnh/TP",    width: "w-32" },
    ],
  },
  skill: {
    label: "Chuẩn kỹ năng", color: "#16a34a", icon: Target, codePrefix: "SKL",
    description: "Khung chuẩn kỹ năng STEM theo quy định của Bộ GD&ĐT, dùng để đánh giá năng lực học sinh.",
    fields: [
      { key: "linhVuc", label: "Lĩnh vực", type: "select", required: true,
        options: ["Science (Khoa học)", "Technology (Công nghệ)", "Engineering (Kỹ thuật)", "Mathematics (Toán học)"] },
      { key: "capDo", label: "Cấp độ", type: "select", required: true,
        options: ["Cơ bản", "Trung cấp", "Nâng cao"] },
    ],
    columns: [
      { key: "code",    label: "Mã",          width: "w-28" },
      { key: "name",    label: "Tên kỹ năng" },
      { key: "linhVuc", label: "Lĩnh vực",   width: "w-48" },
      { key: "capDo",   label: "Cấp độ",     width: "w-28" },
    ],
  },
  subjectGroup: {
    label: "Nhóm môn", color: "#0891b2", icon: Layers, codePrefix: "SG",
    description: "Phân nhóm môn học dùng để phân loại khi khai báo môn học trong hệ thống.",
    fields: [],
    columns: [
      { key: "code", label: "Mã",        width: "w-28" },
      { key: "name", label: "Tên nhóm môn" },
    ],
  },
  program: {
    label: "Chương trình", color: "#dc2626", icon: BookOpen, codePrefix: "PRG",
    description: "Các chương trình đào tạo và khung chương trình học STEM được phê duyệt bởi cơ quan quản lý.",
    fields: [
      { key: "capHocApDung", label: "Cấp học áp dụng", type: "select",
        options: ["Tiểu học", "THCS", "THPT", "Tất cả cấp"] },
      { key: "soTiet", label: "Số tiết / năm", type: "text", placeholder: "VD: 70" },
      { key: "namBanHanh", label: "Năm ban hành", type: "text", placeholder: "VD: 2024" },
    ],
    columns: [
      { key: "code",          label: "Mã",            width: "w-28" },
      { key: "name",          label: "Tên chương trình" },
      { key: "capHocApDung",  label: "Cấp học",       width: "w-32" },
      { key: "soTiet",        label: "Số tiết/năm",   width: "w-28" },
      { key: "namBanHanh",    label: "Năm ban hành",  width: "w-28" },
    ],
  },
};

/* ================================================================ */
/*  HELPERS                                                          */
/* ================================================================ */
function getMeta(item: CatalogItem, key: string): string {
  if (key === "code") return item.code;
  if (key === "name") return item.name;
  return String(item.metadata?.[key] ?? "—");
}

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ================================================================ */
/*  EXPORT DROPDOWN                                                  */
/* ================================================================ */
function ExportDropdown({ onExportJSON, onExportCSV }: { onExportJSON: () => void; onExportCSV: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
        style={{ fontSize: "12.5px", fontWeight: 500 }}>
        <Download className="w-3.5 h-3.5" /> Export <ChevronDown className="w-3 h-3 ml-0.5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
          <button onClick={() => { onExportJSON(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left" style={{ fontSize: "12.5px" }}>
            <FileJson className="w-3.5 h-3.5 text-muted-foreground" /> Xuất JSON
          </button>
          <button onClick={() => { onExportCSV(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left" style={{ fontSize: "12.5px" }}>
            <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Xuất CSV
          </button>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  IMPORT MODAL                                                     */
/* ================================================================ */
interface ParsedRow { code: string; name: string; [k: string]: string }

function ImportModal({
  catalogKey, existingCodes, onClose, onConfirm,
}: {
  catalogKey: CatalogKey;
  existingCodes: Set<string>;
  onClose: () => void;
  onConfirm: (rows: ParsedRow[]) => void;
}) {
  const cfg = CATALOG_CONFIG[catalogKey];
  const Icon = cfg.icon;
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<ParsedRow[] | null>(null);
  const [parseError, setParseError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const allColumns = ["code", "name", ...cfg.fields.map(f => f.key)];

  function downloadTemplate() {
    const header = allColumns.join(",");
    const exampleRow = [
      `${cfg.codePrefix}-1`,
      `Tên ${cfg.label} mẫu`,
      ...cfg.fields.map(f => f.options ? f.options[0] : `Giá trị ${f.label}`),
    ].join(",");
    downloadText(`${header}\n${exampleRow}\n`, `template_${catalogKey}.csv`, "text/csv");
    toast.success("Đã tải file mẫu CSV");
  }

  function parseCSV(text: string): ParsedRow[] {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.startsWith("code") || firstLine.startsWith("mã");
    const dataLines = hasHeader ? lines.slice(1) : lines;
    const headerCols = hasHeader
      ? lines[0].split(",").map(s => s.trim().toLowerCase())
      : allColumns;
    return dataLines.map(line => {
      const vals = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/^"|"$/g, "").trim());
      const row: ParsedRow = { code: "", name: "" };
      headerCols.forEach((col, i) => {
        const mapped = col === "mã" ? "code" : col === "tên" ? "name" : col;
        row[mapped] = vals[i] ?? "";
      });
      return row;
    }).filter(r => r.code && r.name);
  }

  function parseJSON(text: string): ParsedRow[] {
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) throw new Error("JSON phải là mảng");
    return arr.filter((r: ParsedRow) => r.code && r.name);
  }

  function processFile(file: File) {
    setParseError("");
    setPreview(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = file.name.endsWith(".json") ? parseJSON(text) : parseCSV(text);
        if (!rows.length) { setParseError("Không tìm thấy dữ liệu hợp lệ trong file."); return; }
        setPreview(rows);
      } catch {
        setParseError("File không đúng định dạng. Vui lòng kiểm tra lại.");
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  const newRows = useMemo(
    () => preview?.filter(r => !existingCodes.has(r.code.toLowerCase())) ?? [],
    [preview, existingCodes]
  );
  const dupRows = useMemo(
    () => preview?.filter(r => existingCodes.has(r.code.toLowerCase())) ?? [],
    [preview, existingCodes]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col"
        style={{ maxHeight: "85vh" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: cfg.color + "18" }}>
            <Icon className="w-4.5 h-4.5" style={{ color: cfg.color }} />
          </div>
          <div className="flex-1">
            <h2 style={{ fontSize: "15px", fontWeight: 700 }}>Import {cfg.label}</h2>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
              Nhập dữ liệu từ file CSV hoặc JSON
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Template download */}
          <div className="flex items-center justify-between p-3 rounded-lg border"
            style={{ backgroundColor: cfg.color + "08", borderColor: cfg.color + "30" }}>
            <div style={{ fontSize: "12px" }}>
              <p className="font-semibold" style={{ color: cfg.color }}>Cấu trúc file CSV:</p>
              <code className="text-muted-foreground" style={{ fontSize: "11px" }}>
                {allColumns.join(", ")}
              </code>
            </div>
            <button onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white shrink-0 hover:opacity-90"
              style={{ fontSize: "12px", fontWeight: 600, backgroundColor: cfg.color }}>
              <FileDown className="w-3.5 h-3.5" /> Tải file mẫu
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging ? "border-[var(--color)] bg-[var(--color-bg)]" : "border-border hover:bg-secondary/50"
            }`}
            style={{ "--color": cfg.color, "--color-bg": cfg.color + "08" } as React.CSSProperties}
          >
            <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={handleFileChange} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-semibold text-foreground" style={{ fontSize: "13px" }}>
              Kéo thả file vào đây hoặc nhấn để chọn
            </p>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "11.5px" }}>
              Hỗ trợ .csv và .json · Mã trùng sẽ được bỏ qua tự động
            </p>
          </div>

          {parseError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700"
              style={{ fontSize: "12px" }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {parseError}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground" style={{ fontSize: "13px" }}>
                  Xem trước ({preview.length} dòng)
                </span>
                <span className="text-green-600 font-semibold" style={{ fontSize: "12px" }}>
                  · {newRows.length} mới
                </span>
                {dupRows.length > 0 && (
                  <span className="text-amber-600 font-semibold" style={{ fontSize: "12px" }}>
                    · {dupRows.length} trùng (bỏ qua)
                  </span>
                )}
              </div>
              <div className="rounded-lg border border-border overflow-auto" style={{ maxHeight: "200px" }}>
                <table className="w-full text-xs">
                  <thead className="bg-secondary/60 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-muted-foreground font-semibold">Mã</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-semibold">Tên</th>
                      {cfg.fields.map(f => (
                        <th key={f.key} className="px-3 py-2 text-left text-muted-foreground font-semibold">{f.label}</th>
                      ))}
                      <th className="px-3 py-2 text-left text-muted-foreground font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.map((row, i) => {
                      const isDup = existingCodes.has(row.code.toLowerCase());
                      return (
                        <tr key={i} className={isDup ? "bg-amber-50 dark:bg-amber-950/20" : ""}>
                          <td className="px-3 py-1.5 font-mono font-semibold">{row.code}</td>
                          <td className="px-3 py-1.5">{row.name}</td>
                          {cfg.fields.map(f => (
                            <td key={f.key} className="px-3 py-1.5 text-muted-foreground">{row[f.key] || "—"}</td>
                          ))}
                          <td className="px-3 py-1.5">
                            {isDup
                              ? <span className="text-amber-600 font-semibold">Trùng mã</span>
                              : <span className="text-green-600 font-semibold">Mới</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <button onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            Hủy
          </button>
          <button
            onClick={() => { if (newRows.length) onConfirm(newRows); else toast.info("Không có mục mới để nhập"); }}
            disabled={!preview || !newRows.length}
            className="px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontSize: "13px", fontWeight: 600, backgroundColor: cfg.color }}>
            Nhập {newRows.length > 0 ? `${newRows.length} mục` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  ADD / EDIT MODAL                                                 */
/* ================================================================ */
type ModalState = { mode: "closed" } | { mode: "add" } | { mode: "edit"; item: CatalogItem };

function CatalogItemModal({
  catalogKey, modal, existingItems, allItems, onClose, onSave,
}: {
  catalogKey: CatalogKey;
  modal: ModalState;
  existingItems: CatalogItem[];
  allItems: CatalogItem[];
  onClose: () => void;
  onSave: (item: CatalogItem) => void;
}) {
  const cfg = CATALOG_CONFIG[catalogKey];
  const Icon = cfg.icon;
  const editItem = modal.mode === "edit" ? modal.item : null;

  const [formCode, setFormCode] = useState(() => {
    if (editItem) return editItem.code;
    const nums = existingItems.map(i => { const m = i.code.match(/\d+$/); return m ? parseInt(m[0]) : 0; });
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `${cfg.codePrefix}-${next}`;
  });
  const [formName, setFormName] = useState(editItem?.name ?? "");
  const [formMeta, setFormMeta] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    cfg.fields.forEach(f => { init[f.key] = String(editItem?.metadata?.[f.key] ?? ""); });
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setMetaField(key: string, val: string) {
    setFormMeta(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!formCode.trim()) e.code = "Vui lòng nhập mã";
    if (!formName.trim()) e.name = "Vui lòng nhập tên";
    cfg.fields.filter(f => f.required).forEach(f => {
      if (!formMeta[f.key]?.trim()) e[f.key] = `Vui lòng chọn ${f.label.toLowerCase()}`;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const isDup = existingItems.some(i =>
      i.code.toLowerCase() === formCode.trim().toLowerCase() && i.id !== editItem?.id
    );
    if (isDup) { setErrors(prev => ({ ...prev, code: "Mã đã tồn tại" })); return; }

    const metadata: Record<string, unknown> = {};
    cfg.fields.forEach(f => { if (formMeta[f.key]) metadata[f.key] = formMeta[f.key]; });

    onSave({
      id: editItem?.id ?? `local-${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      catalog: catalogKey,
      metadata,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: cfg.color + "18" }}>
            <Icon className="w-4.5 h-4.5" style={{ color: cfg.color }} />
          </div>
          <div className="flex-1">
            <h2 style={{ fontSize: "15px", fontWeight: 700 }}>
              {modal.mode === "add" ? `Thêm ${cfg.label}` : `Chỉnh sửa ${cfg.label}`}
            </h2>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
              {modal.mode === "add" ? "Điền thông tin mục mới" : "Cập nhật thông tin mục"}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Code */}
        <FormField label="Mã" required error={errors.code}>
          <input type="text" value={formCode}
            onChange={e => { setFormCode(e.target.value); setErrors(p => { const x = {...p}; delete x.code; return x; }); }}
            placeholder={`VD: ${cfg.codePrefix}-1`}
            className={`w-full px-3 py-2 bg-background border rounded-lg outline-none font-mono ${errors.code ? "border-red-500" : "border-border"}`}
            style={{ fontSize: "13px" }} autoFocus />
        </FormField>

        {/* Name */}
        <FormField label="Tên" required error={errors.name}>
          <input type="text" value={formName}
            onChange={e => { setFormName(e.target.value); setErrors(p => { const x = {...p}; delete x.name; return x; }); }}
            placeholder={`Tên ${cfg.label.toLowerCase()}`}
            className={`w-full px-3 py-2 bg-background border rounded-lg outline-none ${errors.name ? "border-red-500" : "border-border"}`}
            style={{ fontSize: "13px" }} />
        </FormField>

        {/* Extra fields */}
        {cfg.fields.map(f => {
          const selectOptions = f.dynamicCatalog
            ? allItems.filter(i => i.catalog === f.dynamicCatalog).map(i => i.name)
            : f.options ?? [];
          return (
          <FormField key={f.key} label={f.label} required={f.required} error={errors[f.key]}>
            {f.type === "select" ? (
              <select value={formMeta[f.key] ?? ""}
                onChange={e => setMetaField(f.key, e.target.value)}
                className={`w-full px-3 py-2 bg-background border rounded-lg outline-none ${errors[f.key] ? "border-red-500" : "border-border"}`}
                style={{ fontSize: "13px" }}>
                <option value="">— Chọn {f.label.toLowerCase()} —</option>
                {selectOptions.length === 0
                  ? <option disabled value="">Chưa có nhóm nào — hãy khai báo trước</option>
                  : selectOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type="text" value={formMeta[f.key] ?? ""}
                onChange={e => setMetaField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={`w-full px-3 py-2 bg-background border rounded-lg outline-none ${errors[f.key] ? "border-red-500" : "border-border"}`}
                style={{ fontSize: "13px" }} />
            )}
          </FormField>
        );
        })}

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>Hủy</button>
          <button onClick={handleSave}
            className="px-4 py-2 rounded-lg text-white hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 600, backgroundColor: cfg.color }}>
            {modal.mode === "add" ? "Thêm mục" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="font-semibold text-foreground" style={{ fontSize: "12px" }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 flex items-center gap-1" style={{ fontSize: "11px" }}>
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

/* ================================================================ */
/*  CATALOG DETAIL PAGE                                             */
/* ================================================================ */
function CatalogDetail({ catalogKey, items, allItems, onBack, onItemsChange }: {
  catalogKey: CatalogKey;
  items: CatalogItem[];
  allItems: CatalogItem[];
  onBack: () => void;
  onItemsChange: (next: CatalogItem[]) => void;
}) {
  const cfg = CATALOG_CONFIG[catalogKey];
  const Icon = cfg.icon;
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [showImport, setShowImport] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    items.filter(c => !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const existingCodes = useMemo(() => new Set(items.map(i => i.code.toLowerCase())), [items]);

  function handleSaveItem(saved: CatalogItem) {
    if (modal.mode === "add") {
      onItemsChange([...items, saved]);
      toast.success(`Đã thêm "${saved.name}"`);
    } else {
      onItemsChange(items.map(i => i.id === saved.id ? saved : i));
      toast.success(`Đã cập nhật "${saved.name}"`);
    }
    setModal({ mode: "closed" });
  }

  function handleDelete(item: CatalogItem) {
    onItemsChange(items.filter(i => i.id !== item.id));
    setConfirmDeleteId(null);
    toast.success(`Đã xóa "${item.name}"`);
  }

  function handleImportConfirm(rows: { code: string; name: string; [k: string]: string }[]) {
    const newItems: CatalogItem[] = rows.map(r => {
      const metadata: Record<string, unknown> = {};
      cfg.fields.forEach(f => { if (r[f.key]) metadata[f.key] = r[f.key]; });
      return { id: `import-${Date.now()}-${Math.random()}`, code: r.code.toUpperCase(), name: r.name, catalog: catalogKey, metadata };
    });
    onItemsChange([...items, ...newItems]);
    setShowImport(false);
    toast.success(`Đã nhập ${newItems.length} mục mới`);
  }

  function handleExportJSON() {
    downloadText(JSON.stringify(items, null, 2), `catalog_${catalogKey}.json`, "application/json");
    toast.success(`Đã xuất ${items.length} mục (JSON)`);
  }

  function handleExportCSV() {
    const cols = ["code", "name", ...cfg.fields.map(f => f.key)];
    const header = cols.join(",");
    const rows = items.map(i => cols.map(c => {
      const v = getMeta(i, c);
      return v.includes(",") ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(","));
    downloadText([header, ...rows].join("\n"), `catalog_${catalogKey}.csv`, "text/csv");
    toast.success(`Đã xuất ${items.length} mục (CSV)`);
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "12px" }}>
        <button onClick={onBack} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Danh mục dùng chung
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>

      {/* Header card */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between gap-4"
        style={{ borderTop: `3px solid ${cfg.color}` }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: cfg.color + "18" }}>
            <Icon className="w-6 h-6" style={{ color: cfg.color }} />
          </div>
          <div>
            <h1 className="font-bold text-foreground" style={{ fontSize: "17px" }}>{cfg.label}</h1>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>{cfg.description}</p>
            <div className="mt-1.5 flex items-center gap-2" style={{ fontSize: "11.5px" }}>
              <span className="px-2 py-0.5 rounded-full text-white font-semibold"
                style={{ backgroundColor: cfg.color, fontSize: "11px" }}>{items.length} mục</span>
              <span className="text-muted-foreground">
                Cột dữ liệu: {cfg.columns.map(c => c.label).join(", ")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "12.5px", fontWeight: 500 }}>
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <ExportDropdown onExportJSON={handleExportJSON} onExportCSV={handleExportCSV} />
          <button onClick={() => setModal({ mode: "add" })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:opacity-90"
            style={{ fontSize: "12.5px", fontWeight: 600, backgroundColor: cfg.color }}>
            <Plus className="w-3.5 h-3.5" /> Thêm mục
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Tìm theo mã hoặc tên ${cfg.label.toLowerCase()}...`}
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "13px" }} />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground text-xs font-semibold">
              <tr>
                {cfg.columns.map(col => (
                  <th key={col.key} className={`px-4 py-2.5 ${col.width ?? ""}`}>{col.label}</th>
                ))}
                <th className="px-4 py-2.5 text-right w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "13px" }}>
              {filtered.map(c => (
                <tr key={c.id}
                  className={`hover:bg-secondary/50 transition-colors ${confirmDeleteId === c.id ? "bg-red-50 dark:bg-red-950/20" : ""}`}>
                  {cfg.columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      {col.key === "code" ? (
                        <code className="px-1.5 py-0.5 rounded font-mono font-semibold"
                          style={{ fontSize: "11px", color: cfg.color, backgroundColor: cfg.color + "15" }}>
                          {c.code}
                        </code>
                      ) : col.key === "name" ? (
                        <span className="font-medium">{c.name}</span>
                      ) : (
                        <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
                          {getMeta(c, col.key)}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    {confirmDeleteId === c.id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Xác nhận xóa?</span>
                        <button onClick={() => handleDelete(c)}
                          className="inline-flex items-center gap-0.5 px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700">
                          <Check className="w-3 h-3" /> Xóa
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          className="p-1 hover:bg-secondary rounded">
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </span>
                    ) : (
                      <>
                        <button onClick={() => setModal({ mode: "edit", item: c })}
                          className="p-1.5 hover:bg-secondary rounded" title="Sửa">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => setConfirmDeleteId(c.id)}
                          className="p-1.5 hover:bg-secondary rounded ml-1" title="Xóa">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-10 text-center space-y-2">
              <Icon className="w-8 h-8 mx-auto" style={{ color: cfg.color + "60" }} />
              <p className="text-muted-foreground font-medium" style={{ fontSize: "13px" }}>
                {search ? `Không tìm thấy "${search}"` : "Chưa có mục nào"}
              </p>
              {!search && (
                <button onClick={() => setModal({ mode: "add" })}
                  className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90"
                  style={{ backgroundColor: cfg.color }}>
                  <Plus className="w-3 h-3" /> Thêm mục đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {modal.mode !== "closed" && (
        <CatalogItemModal catalogKey={catalogKey} modal={modal}
          existingItems={items} allItems={allItems}
          onClose={() => setModal({ mode: "closed" })} onSave={handleSaveItem} />
      )}
      {showImport && (
        <ImportModal catalogKey={catalogKey} existingCodes={existingCodes}
          onClose={() => setShowImport(false)} onConfirm={handleImportConfirm} />
      )}
    </div>
  );
}

/* ================================================================ */
/*  OVERVIEW                                                         */
/* ================================================================ */
export function CommonCatalogManager() {
  const [allItems, setAllItems] = useState<CatalogItem[]>(catalogs);
  const [selected, setSelected] = useState<CatalogKey | null>(null);

  const countByType = useMemo(() => {
    const m: Record<string, number> = {};
    allItems.forEach(c => { m[c.catalog] = (m[c.catalog] || 0) + 1; });
    return m;
  }, [allItems]);

  const handleItemsChange = useCallback((catalogKey: CatalogKey, next: CatalogItem[]) => {
    setAllItems(prev => [...prev.filter(i => i.catalog !== catalogKey), ...next]);
  }, []);

  if (selected) {
    return (
      <CatalogDetail catalogKey={selected}
        items={allItems.filter(i => i.catalog === selected)}
        allItems={allItems}
        onBack={() => setSelected(null)}
        onItemsChange={next => handleItemsChange(selected, next)} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Layers} title="Danh mục dùng chung"
        subtitle="Quản lý và chuẩn hóa các danh mục dữ liệu dùng chung đảm bảo tính thống nhất trong toàn hệ thống."
        accentColor="#7c3aed" />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-secondary/40">
          <span className="font-semibold text-foreground" style={{ fontSize: "13px" }}>
            {Object.keys(CATALOG_CONFIG).length} danh mục · {allItems.length} mục
          </span>
        </div>
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground text-xs font-semibold">
            <tr>
              <th className="px-4 py-2.5">Danh mục</th>
              <th className="px-4 py-2.5">Mô tả</th>
              <th className="px-4 py-2.5">Trường dữ liệu</th>
              <th className="px-4 py-2.5 text-center w-24">Số mục</th>
              <th className="px-4 py-2.5 w-28"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(Object.keys(CATALOG_CONFIG) as CatalogKey[]).map(k => {
              const cfg = CATALOG_CONFIG[k];
              const Icon = cfg.icon;
              return (
                <tr key={k} className="hover:bg-secondary/40 cursor-pointer transition-colors"
                  onClick={() => setSelected(k)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cfg.color + "18" }}>
                        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                      <span className="font-semibold text-foreground" style={{ fontSize: "13px" }}>{cfg.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{cfg.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {cfg.columns.filter(c => c.key !== "code" && c.key !== "name").map(c => (
                        <span key={c.key} className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                          style={{ fontSize: "10.5px" }}>{c.label}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-bold"
                      style={{ fontSize: "12px", color: cfg.color, backgroundColor: cfg.color + "15" }}>
                      {countByType[k] || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 font-semibold"
                      style={{ fontSize: "12px", color: cfg.color }}>
                      Quản lý <ChevronRight className="w-3.5 h-3.5" />
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
}

export default CommonCatalogManager;
