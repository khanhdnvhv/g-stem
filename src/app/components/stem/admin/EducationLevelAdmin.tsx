import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Plus, Pencil, EyeOff, Eye,
  CheckCircle2, XCircle, AlertTriangle, X, Check, Loader2,
} from "lucide-react";
import { toast } from "sonner";

/* ── Types ─────────────────────────────────────────────── */

interface EducationLevel {
  id: string;
  code: string;
  name: string;
  description: string;
  subjectCount: number;
  gradeCount: number;
  displayOrder: number;
  status: "active" | "hidden";
  createdAt: string;
}

/* ── Mock data ──────────────────────────────────────────── */

const INITIAL_LEVELS: EducationLevel[] = [
  { id: "LV-01", code: "MN",   name: "Mầm non",             description: "Cấp học dành cho trẻ 3–5 tuổi",           subjectCount: 4,  gradeCount: 3, displayOrder: 1, status: "active", createdAt: "2024-01-10" },
  { id: "LV-02", code: "TH",   name: "Tiểu học",             description: "Cấp học từ lớp 1 đến lớp 5",             subjectCount: 11, gradeCount: 5, displayOrder: 2, status: "active", createdAt: "2024-01-10" },
  { id: "LV-03", code: "THCS", name: "Trung học cơ sở",      description: "Cấp học từ lớp 6 đến lớp 9",             subjectCount: 14, gradeCount: 4, displayOrder: 3, status: "active", createdAt: "2024-01-10" },
  { id: "LV-04", code: "THPT", name: "Trung học phổ thông",  description: "Cấp học từ lớp 10 đến lớp 12",           subjectCount: 13, gradeCount: 3, displayOrder: 4, status: "active", createdAt: "2024-01-10" },
  { id: "LV-05", code: "CD",   name: "Cao đẳng / Nghề",      description: "Đào tạo nghề và cao đẳng chuyên nghiệp", subjectCount: 6,  gradeCount: 3, displayOrder: 5, status: "active", createdAt: "2024-03-15" },
  { id: "LV-06", code: "DH",   name: "Đại học",              description: "Đào tạo đại học và sau đại học",          subjectCount: 0,  gradeCount: 0, displayOrder: 6, status: "hidden", createdAt: "2024-03-15" },
];

const LEVEL_REFS: Record<string, { programs: number; accounts: number }> = {
  "LV-01": { programs: 2,  accounts: 15  },
  "LV-02": { programs: 18, accounts: 124 },
  "LV-03": { programs: 22, accounts: 156 },
  "LV-04": { programs: 15, accounts: 98  },
  "LV-05": { programs: 3,  accounts: 12  },
  "LV-06": { programs: 0,  accounts: 0   },
};

/* ── Helpers ────────────────────────────────────────────── */

function StatusBadge({ status }: { status: EducationLevel["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 size={11} /> Hiển thị
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <XCircle size={11} /> Ẩn
    </span>
  );
}

/* ── SortableRow ────────────────────────────────────────── */

function SortableRow({
  level,
  onEdit,
  onToggleHide,
}: {
  level: EducationLevel;
  onEdit: (level: EducationLevel) => void;
  onToggleHide: (level: EducationLevel) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: level.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-border hover:bg-muted/30 transition-colors"
    >
      <td className="py-3 px-4 text-sm text-muted-foreground">{level.displayOrder}</td>
      <td className="py-3 px-4">
        <div>
          <div className="font-medium text-sm">{level.name}</div>
          {level.description && (
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{level.description}</div>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{level.code}</code>
      </td>
      <td className="py-3 px-4"><StatusBadge status={level.status} /></td>
      <td className="py-3 px-4 text-xs text-muted-foreground">{level.createdAt}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(level)}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Chỉnh sửa"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onToggleHide(level)}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={level.status === "active" ? "Ẩn" : "Hiển thị lại"}
          >
            {level.status === "active" ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            className="p-1.5 rounded cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Kéo để sắp xếp"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── LevelFormModal ─────────────────────────────────────── */

type CodeState = "idle" | "checking" | "ok" | "taken";

function LevelFormModal({
  editing,
  existingCodes,
  defaultOrder,
  onSave,
  onClose,
}: {
  editing: EducationLevel | null;
  existingCodes: string[];
  defaultOrder: number;
  onSave: (data: { name: string; code: string; description: string; displayOrder: number }) => void;
  onClose: () => void;
}) {
  const [name, setName]           = useState(editing?.name ?? "");
  const [code, setCode]           = useState(editing?.code ?? "");
  const [desc, setDesc]           = useState(editing?.description ?? "");
  const [order, setOrder]         = useState(editing?.displayOrder ?? defaultOrder);
  const [codeState, setCodeState] = useState<CodeState>("idle");
  const codeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const otherCodes = existingCodes.filter((c) => c !== editing?.code);

  function handleCodeBlur() {
    const val = code.trim().toUpperCase();
    if (!val || val === editing?.code) { setCodeState("idle"); return; }
    if (otherCodes.includes(val)) { setCodeState("taken"); return; }
    setCodeState("checking");
    codeTimer.current = setTimeout(() => {
      setCodeState(otherCodes.includes(val) ? "taken" : "ok");
    }, 600);
  }

  useEffect(() => () => { if (codeTimer.current) clearTimeout(codeTimer.current); }, []);

  const handleCodeChange = (v: string) => {
    setCode(v.toUpperCase().replace(/[^A-Z0-9_]/g, ""));
    setCodeState("idle");
  };

  const canSave = name.trim().length > 0 && code.trim().length > 0 &&
    codeState !== "taken" && codeState !== "checking";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">
            {editing ? "Chỉnh sửa cấp học" : "Thêm cấp học"}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên cấp học <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Tiểu học"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Mã */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mã <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-muted-foreground ml-1">(chữ hoa, chữ số, dấu _)</span>
            </label>
            <div className="relative">
              <input
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onBlur={handleCodeBlur}
                placeholder="VD: TH"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 bg-background pr-8 ${
                  codeState === "taken"
                    ? "border-red-400 focus:ring-red-300"
                    : codeState === "ok"
                    ? "border-green-400 focus:ring-green-300"
                    : "border-border focus:ring-primary/40"
                }`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {codeState === "checking" && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
                {codeState === "ok"       && <Check size={14} className="text-green-500" />}
                {codeState === "taken"    && <X size={14} className="text-red-500" />}
              </div>
            </div>
            {codeState === "taken" && (
              <p className="text-xs text-red-500 mt-1">Mã này đã được sử dụng.</p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả ngắn</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder="Mô tả ngắn về cấp học..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Thứ tự */}
          <div>
            <label className="block text-sm font-medium mb-1">Thứ tự hiển thị</label>
            <input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            Huỷ
          </button>
          <button
            disabled={!canSave}
            onClick={() => onSave({ name: name.trim(), code: code.trim(), description: desc.trim(), displayOrder: order })}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── HideConfirmModal ───────────────────────────────────── */

function HideConfirmModal({
  level,
  refs,
  onConfirm,
  onClose,
}: {
  level: EducationLevel;
  refs: { programs: number; accounts: number };
  onConfirm: () => void;
  onClose: () => void;
}) {
  const hasRefs = refs.programs > 0 || refs.accounts > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-base font-semibold">
              {level.status === "active" ? "Ẩn cấp học?" : "Hiển thị lại cấp học?"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>{level.name}</strong>
            </p>
          </div>
        </div>

        {hasRefs && level.status === "active" && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 mb-4 text-sm text-amber-800 dark:text-amber-300">
            Cấp học này đang được dùng trong{" "}
            <strong>{refs.programs} chương trình STEM</strong> và{" "}
            <strong>{refs.accounts} tài khoản</strong>. Ẩn sẽ không ảnh hưởng dữ liệu hiện có
            nhưng NCC và GV sẽ không thể chọn cấp học này khi tạo mới.
          </div>
        )}

        {!hasRefs && level.status === "active" && (
          <p className="text-sm text-muted-foreground mb-4">
            Cấp học này chưa được sử dụng. Thao tác ẩn có thể hoàn tác bất kỳ lúc nào.
          </p>
        )}

        {level.status === "hidden" && (
          <p className="text-sm text-muted-foreground mb-4">
            Cấp học sẽ hiển thị trở lại trong danh sách lựa chọn.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            {level.status === "active" ? "Ẩn" : "Hiển thị lại"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

export function EducationLevelAdmin() {
  const [levels, setLevels]             = useState<EducationLevel[]>(INITIAL_LEVELS);
  const [formTarget, setFormTarget]     = useState<EducationLevel | "new" | null>(null);
  const [hideTarget, setHideTarget]     = useState<EducationLevel | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLevels((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex).map((l, i) => ({ ...l, displayOrder: i + 1 }));
      setTimeout(() => toast.success("Đã lưu thứ tự hiển thị"), 300);
      return reordered;
    });
  };

  const handleSave = (data: { name: string; code: string; description: string; displayOrder: number }) => {
    if (formTarget === "new") {
      const newLevel: EducationLevel = {
        id: `LV-${String(Date.now()).slice(-4)}`,
        ...data,
        subjectCount: 0,
        gradeCount: 0,
        status: "active",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setLevels((prev) => {
        const sorted = [...prev, newLevel].sort((a, b) => a.displayOrder - b.displayOrder);
        return sorted.map((l, i) => ({ ...l, displayOrder: i + 1 }));
      });
      toast.success(`Đã thêm cấp học "${data.name}"`);
    } else if (formTarget) {
      setLevels((prev) =>
        prev.map((l) => l.id === formTarget.id ? { ...l, ...data } : l)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((l, i) => ({ ...l, displayOrder: i + 1 }))
      );
      toast.success(`Đã cập nhật "${data.name}"`);
    }
    setFormTarget(null);
  };

  const handleToggleHide = (level: EducationLevel) => {
    if (level.status === "hidden") {
      setLevels((prev) => prev.map((l) => l.id === level.id ? { ...l, status: "active" } : l));
      toast.success(`Đã hiển thị lại "${level.name}"`);
      return;
    }
    setHideTarget(level);
  };

  const handleHideConfirm = () => {
    if (!hideTarget) return;
    setLevels((prev) => prev.map((l) => l.id === hideTarget.id ? { ...l, status: "hidden" } : l));
    toast.info(`Đã ẩn "${hideTarget.name}"`);
    setHideTarget(null);
  };

  const existingCodes = levels.map((l) => l.code);
  const defaultOrder  = levels.length + 1;

  return (
    <>
      {/* Form modal */}
      {formTarget !== null && (
        <LevelFormModal
          editing={formTarget === "new" ? null : formTarget}
          existingCodes={existingCodes}
          defaultOrder={defaultOrder}
          onSave={handleSave}
          onClose={() => setFormTarget(null)}
        />
      )}

      {/* Hide confirm modal */}
      {hideTarget && (
        <HideConfirmModal
          level={hideTarget}
          refs={LEVEL_REFS[hideTarget.id] ?? { programs: 0, accounts: 0 }}
          onConfirm={handleHideConfirm}
          onClose={() => setHideTarget(null)}
        />
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Khai báo Cấp học</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Quản lý danh sách cấp học trong hệ thống. Kéo thả để thay đổi thứ tự hiển thị.
            </p>
          </div>
          <button
            onClick={() => setFormTarget("new")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} /> Thêm cấp học
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tổng cấp học",  value: levels.length },
            { label: "Đang hiển thị", value: levels.filter((l) => l.status === "active").length },
            { label: "Đang ẩn",       value: levels.filter((l) => l.status === "hidden").length },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-14">STT</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Tên cấp học</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-24">Mã</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-32">Trạng thái</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Ngày tạo</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <SortableContext items={levels.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  {levels.map((level) => (
                    <SortableRow
                      key={level.id}
                      level={level}
                      onEdit={(l) => setFormTarget(l)}
                      onToggleHide={handleToggleHide}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>

          <div className="border-t border-border px-4 py-2 bg-muted/20 text-xs text-muted-foreground flex items-center gap-1.5">
            <GripVertical size={12} /> Kéo thả hàng để sắp xếp lại thứ tự — tự động lưu.
          </div>
        </div>
      </div>
    </>
  );
}
