import { useState } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Plus, Pencil, EyeOff, Eye, Check, X,
  Save, RotateCcw, AlertTriangle, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

/* ── Types ─────────────────────────────────────────────── */

interface Grade {
  id: string;
  levelId: string;
  name: string;
  code: string;
  displayOrder: number;
  accountCount: number;
  status: "active" | "hidden";
}

interface EditState {
  name: string;
  code: string;
  displayOrder: number;
  codeError: string;
}

interface AddState {
  name: string;
  code: string;
  displayOrder: number;
  codeError: string;
  codeEdited: boolean;
}

/* ── Mock data ──────────────────────────────────────────── */

const LEVELS = [
  { id: "LV-01", name: "Mầm non" },
  { id: "LV-02", name: "Tiểu học" },
  { id: "LV-03", name: "Trung học cơ sở" },
  { id: "LV-04", name: "Trung học phổ thông" },
  { id: "LV-05", name: "Cao đẳng / Nghề" },
  { id: "LV-06", name: "Đại học" },
];

const INITIAL_GRADES: Grade[] = [
  { id: "GR-MN-01", levelId: "LV-01", name: "Nhà trẻ",  code: "NT",  displayOrder: 1, accountCount: 8,  status: "active" },
  { id: "GR-MN-02", levelId: "LV-01", name: "Lớp Chồi", code: "LC",  displayOrder: 2, accountCount: 12, status: "active" },
  { id: "GR-MN-03", levelId: "LV-01", name: "Lớp Lá",   code: "LL",  displayOrder: 3, accountCount: 15, status: "active" },
  { id: "GR-TH-01", levelId: "LV-02", name: "Lớp 1", code: "L1", displayOrder: 1, accountCount: 42, status: "active" },
  { id: "GR-TH-02", levelId: "LV-02", name: "Lớp 2", code: "L2", displayOrder: 2, accountCount: 38, status: "active" },
  { id: "GR-TH-03", levelId: "LV-02", name: "Lớp 3", code: "L3", displayOrder: 3, accountCount: 45, status: "active" },
  { id: "GR-TH-04", levelId: "LV-02", name: "Lớp 4", code: "L4", displayOrder: 4, accountCount: 40, status: "active" },
  { id: "GR-TH-05", levelId: "LV-02", name: "Lớp 5", code: "L5", displayOrder: 5, accountCount: 0,  status: "hidden" },
  { id: "GR-CS-01", levelId: "LV-03", name: "Lớp 6", code: "L6", displayOrder: 1, accountCount: 52, status: "active" },
  { id: "GR-CS-02", levelId: "LV-03", name: "Lớp 7", code: "L7", displayOrder: 2, accountCount: 49, status: "active" },
  { id: "GR-CS-03", levelId: "LV-03", name: "Lớp 8", code: "L8", displayOrder: 3, accountCount: 51, status: "active" },
  { id: "GR-CS-04", levelId: "LV-03", name: "Lớp 9", code: "L9", displayOrder: 4, accountCount: 44, status: "active" },
  { id: "GR-PT-01", levelId: "LV-04", name: "Lớp 10", code: "L10", displayOrder: 1, accountCount: 38, status: "active" },
  { id: "GR-PT-02", levelId: "LV-04", name: "Lớp 11", code: "L11", displayOrder: 2, accountCount: 35, status: "active" },
  { id: "GR-PT-03", levelId: "LV-04", name: "Lớp 12", code: "L12", displayOrder: 3, accountCount: 0,  status: "hidden" },
  { id: "GR-CD-01", levelId: "LV-05", name: "Năm 1", code: "N1", displayOrder: 1, accountCount: 6, status: "active" },
  { id: "GR-CD-02", levelId: "LV-05", name: "Năm 2", code: "N2", displayOrder: 2, accountCount: 4, status: "active" },
  { id: "GR-CD-03", levelId: "LV-05", name: "Năm 3", code: "N3", displayOrder: 3, accountCount: 2, status: "active" },
  { id: "GR-DH-01", levelId: "LV-06", name: "Năm 1", code: "DH1", displayOrder: 1, accountCount: 0, status: "active" },
  { id: "GR-DH-02", levelId: "LV-06", name: "Năm 2", code: "DH2", displayOrder: 2, accountCount: 0, status: "active" },
];

/* ── Helpers ────────────────────────────────────────────── */

function autoCode(name: string): string {
  const lopMatch = name.match(/lớp\s*(\d+)/i);
  if (lopMatch) return `L${lopMatch[1]}`;
  const namMatch = name.match(/năm\s*(\d+)/i);
  if (namMatch) return `N${namMatch[1]}`;
  const specials: Record<string, string> = {
    "nhà trẻ": "NT", "lớp chồi": "LC", "lớp lá": "LL",
  };
  const lower = name.trim().toLowerCase();
  if (specials[lower]) return specials[lower];
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? "").join("").replace(/[^A-Z0-9]/g, "")
    || name.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeCode(v: string) {
  return v.toUpperCase().replace(/[^A-Z0-9_]/g, "");
}

function StatusBadge({ status }: { status: Grade["status"] }) {
  return status === "active"
    ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Hiển thị</span>
    : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Ẩn</span>;
}

const INPUT_CLS = "px-2 py-1 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
const INPUT_ERR = "px-2 py-1 rounded border border-red-400 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-300";

/* ── SortableGradeRow ───────────────────────────────────── */

function SortableGradeRow({
  grade, stt, canDrag, isEditing, editState,
  onEditChange, onSaveEdit, onCancelEdit, onStartEdit, onToggleHide,
}: {
  grade: Grade;
  stt: number;
  canDrag: boolean;
  isEditing: boolean;
  editState: EditState;
  onEditChange: (p: Partial<EditState>) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onToggleHide: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: grade.id, disabled: !canDrag });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  if (isEditing) {
    return (
      <tr ref={setNodeRef} style={style} className="border-b border-border bg-blue-50/40 dark:bg-blue-950/20">
        <td className="py-2 px-3 text-muted-foreground/25"><GripVertical size={14} /></td>
        <td className="py-2 px-4 text-sm text-muted-foreground">{stt}</td>
        <td className="py-2 px-2">
          <input value={editState.name} onChange={e => onEditChange({ name: e.target.value })}
            className={`w-full ${INPUT_CLS}`} placeholder="Tên khối *" />
        </td>
        <td className="py-2 px-2">
          <input value={editState.code} onChange={e => onEditChange({ code: normalizeCode(e.target.value), codeError: "" })}
            className={`w-24 font-mono ${editState.codeError ? INPUT_ERR : INPUT_CLS}`} placeholder="Mã *" />
          {editState.codeError && <p className="text-xs text-red-500 mt-0.5">{editState.codeError}</p>}
        </td>
        <td className="py-2 px-2">
          <input type="number" min={1} value={editState.displayOrder}
            onChange={e => onEditChange({ displayOrder: parseInt(e.target.value) || 1 })}
            className={`w-16 text-center ${INPUT_CLS}`} />
        </td>
        <td className="py-2 px-4"><StatusBadge status={grade.status} /></td>
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
    <tr ref={setNodeRef} style={style} className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-3">
        <button
          className={`p-0.5 rounded transition-colors ${canDrag ? "cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted" : "text-muted-foreground/25 cursor-not-allowed"}`}
          title={canDrag ? "Kéo để sắp xếp" : "Xoá bộ lọc trạng thái để sắp xếp"}
          {...(canDrag ? { ...attributes, ...listeners } : {})}
        >
          <GripVertical size={14} />
        </button>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{stt}</td>
      <td className="py-3 px-4 font-medium text-sm">{grade.name}</td>
      <td className="py-3 px-4">
        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{grade.code}</code>
      </td>
      <td className="py-3 px-4 text-sm text-center">{grade.displayOrder}</td>
      <td className="py-3 px-4"><StatusBadge status={grade.status} /></td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1">
          <button onClick={onStartEdit}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Chỉnh sửa">
            <Pencil size={14} />
          </button>
          <button onClick={onToggleHide}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={grade.status === "active" ? "Ẩn" : "Hiển thị lại"}>
            {grade.status === "active" ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── HideModal ──────────────────────────────────────────── */

function HideModal({ grade, onConfirm, onClose }: { grade: Grade; onConfirm: () => void; onClose: () => void }) {
  const hasAccounts = grade.accountCount > 0;

  if (grade.status === "hidden") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
          <h2 className="text-base font-semibold mb-2">Hiển thị lại khối học?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>{grade.name}</strong> sẽ hiển thị trở lại trong toàn bộ hệ thống.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Huỷ</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Hiển thị lại</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-base font-semibold">Ẩn khối học?</h2>
            <p className="text-sm text-muted-foreground mt-0.5"><strong>{grade.name}</strong></p>
          </div>
        </div>
        {hasAccounts ? (
          <>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 mb-4 text-sm text-red-800 dark:text-red-300">
              Khối này đang có <strong>{grade.accountCount} tài khoản</strong>. Vui lòng chuyển tất cả tài khoản sang khối khác trước khi ẩn.
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Đóng</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">Khối này chưa có tài khoản nào. Bạn có thể ẩn ngay.</p>
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

/* ── Main component ─────────────────────────────────────── */

export function GradeAdmin() {
  const [grades, setGrades]           = useState<Grade[]>(INITIAL_GRADES);
  const [savedGrades, setSavedGrades] = useState<Grade[]>(INITIAL_GRADES);
  const [isDirty, setIsDirty]         = useState(false);

  const [selectedLevel, setSelectedLevel] = useState("LV-01");
  const [statusFilter, setStatusFilter]   = useState<"all" | "active" | "hidden">("all");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: "", code: "", displayOrder: 1, codeError: "" });

  const [isAdding, setIsAdding] = useState(false);
  const [addState, setAddState] = useState<AddState>({ name: "", code: "", displayOrder: 1, codeError: "", codeEdited: false });

  const [hideTarget, setHideTarget] = useState<Grade | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const levelGrades = grades.filter(g => g.levelId === selectedLevel).sort((a, b) => a.displayOrder - b.displayOrder);
  const filteredGrades = statusFilter === "all" ? levelGrades : levelGrades.filter(g => g.status === statusFilter);
  const canDrag = statusFilter === "all" && !isAdding && editingId === null;
  const levelName = LEVELS.find(l => l.id === selectedLevel)?.name ?? "";
  const levelCodes = (excludeId?: string) => grades.filter(g => g.levelId === selectedLevel && g.id !== excludeId).map(g => g.code);

  const handleLevelChange = (id: string) => {
    if (isDirty) { setGrades(savedGrades); setIsDirty(false); toast.info("Đã huỷ thứ tự chưa lưu"); }
    setEditingId(null);
    setIsAdding(false);
    setSelectedLevel(id);
    setStatusFilter("all");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = levelGrades.findIndex(g => g.id === active.id);
    const newIdx = levelGrades.findIndex(g => g.id === over.id);
    const reordered = arrayMove(levelGrades, oldIdx, newIdx).map((g, i) => ({ ...g, displayOrder: i + 1 }));
    setGrades(prev => [...prev.filter(g => g.levelId !== selectedLevel), ...reordered]);
    setIsDirty(true);
  };

  const handleSaveOrder = () => { setSavedGrades(grades); setIsDirty(false); toast.success("Đã lưu thứ tự khối học"); };
  const handleCancelOrder = () => { setGrades(savedGrades); setIsDirty(false); };

  const handleStartEdit = (grade: Grade) => {
    setIsAdding(false);
    setEditingId(grade.id);
    setEditState({ name: grade.name, code: grade.code, displayOrder: grade.displayOrder, codeError: "" });
  };

  const handleSaveEdit = () => {
    if (!editState.name.trim() || !editState.code.trim()) return;
    if (levelCodes(editingId!).includes(editState.code)) {
      setEditState(s => ({ ...s, codeError: "Mã đã tồn tại trong cấp học này" }));
      return;
    }
    setGrades(prev => prev.map(g => g.id === editingId ? { ...g, name: editState.name.trim(), code: editState.code, displayOrder: editState.displayOrder } : g));
    setSavedGrades(prev => prev.map(g => g.id === editingId ? { ...g, name: editState.name.trim(), code: editState.code, displayOrder: editState.displayOrder } : g));
    toast.success(`Đã cập nhật "${editState.name}"`);
    setEditingId(null);
  };

  const handleStartAdd = () => {
    setEditingId(null);
    const nextOrder = levelGrades.length + 1;
    setAddState({ name: "", code: "", displayOrder: nextOrder, codeError: "", codeEdited: false });
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
    const newGrade: Grade = {
      id: `GR-${Date.now()}`,
      levelId: selectedLevel,
      name: addState.name.trim(),
      code: addState.code,
      displayOrder: addState.displayOrder,
      accountCount: 0,
      status: "active",
    };
    setGrades(prev => [...prev, newGrade]);
    setSavedGrades(prev => [...prev, newGrade]);
    toast.success(`Đã thêm "${newGrade.name}"`);
    setIsAdding(false);
  };

  const handleHideConfirm = () => {
    if (!hideTarget) return;
    const newStatus = hideTarget.status === "active" ? "hidden" : "active";
    const updater = (prev: Grade[]) => prev.map(g => g.id === hideTarget.id ? { ...g, status: newStatus } : g);
    setGrades(updater);
    setSavedGrades(updater);
    newStatus === "hidden" ? toast.info(`Đã ẩn "${hideTarget.name}"`) : toast.success(`Đã hiển thị lại "${hideTarget.name}"`);
    setHideTarget(null);
  };

  return (
    <>
      {hideTarget && <HideModal grade={hideTarget} onConfirm={handleHideConfirm} onClose={() => setHideTarget(null)} />}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Khai báo Khối học</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Quản lý danh sách khối học theo từng cấp học.</p>
          </div>
          <button
            onClick={handleStartAdd}
            disabled={isAdding || isDirty}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={15} /> Thêm khối học
          </button>
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
          {statusFilter !== "all" && (
            <button onClick={() => setStatusFilter("all")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors text-muted-foreground">
              <X size={13} /> Xoá bộ lọc
            </button>
          )}
        </div>

        {/* Table card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Table top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-sm font-medium text-muted-foreground">
              {filteredGrades.length} khối học · {levelName}
              {statusFilter !== "all" && <span className="ml-1 text-amber-600 dark:text-amber-400">(đang lọc)</span>}
            </p>
            {isDirty && (
              <div className="flex items-center gap-2">
                <button onClick={handleCancelOrder}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                  <RotateCcw size={13} /> Huỷ thứ tự
                </button>
                <button onClick={handleSaveOrder}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Save size={13} /> Lưu thứ tự
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="py-3 px-3 w-10"></th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-14">STT</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Tên khối</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Mã khối</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-muted-foreground w-24">Thứ tự</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Trạng thái</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <SortableContext items={filteredGrades.map(g => g.id)} strategy={verticalListSortingStrategy}>
                  {filteredGrades.map((grade, idx) => (
                    <SortableGradeRow
                      key={grade.id}
                      grade={grade}
                      stt={idx + 1}
                      canDrag={canDrag}
                      isEditing={editingId === grade.id}
                      editState={editState}
                      onEditChange={p => setEditState(s => ({ ...s, ...p }))}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={() => setEditingId(null)}
                      onStartEdit={() => handleStartEdit(grade)}
                      onToggleHide={() => setHideTarget(grade)}
                    />
                  ))}
                </SortableContext>

                {/* Inline add row */}
                {isAdding && (
                  <tr className="border-b border-border bg-green-50/30 dark:bg-green-950/20">
                    <td className="py-2 px-3 text-muted-foreground/25"><GripVertical size={14} /></td>
                    <td className="py-2 px-4 text-sm text-muted-foreground">—</td>
                    <td className="py-2 px-2">
                      <input value={addState.name} onChange={e => handleAddNameChange(e.target.value)}
                        className={`w-full ${INPUT_CLS}`} placeholder="Tên khối *" autoFocus />
                    </td>
                    <td className="py-2 px-2">
                      <input value={addState.code}
                        onChange={e => setAddState(s => ({ ...s, code: normalizeCode(e.target.value), codeError: "", codeEdited: true }))}
                        className={`w-24 font-mono ${addState.codeError ? INPUT_ERR : INPUT_CLS}`} placeholder="Mã *" />
                      {addState.codeError && <p className="text-xs text-red-500 mt-0.5">{addState.codeError}</p>}
                    </td>
                    <td className="py-2 px-2">
                      <input type="number" min={1} value={addState.displayOrder}
                        onChange={e => setAddState(s => ({ ...s, displayOrder: parseInt(e.target.value) || 1 }))}
                        className={`w-16 text-center ${INPUT_CLS}`} />
                    </td>
                    <td className="py-2 px-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Hiển thị</span>
                    </td>
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

                {filteredGrades.length === 0 && !isAdding && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      Không có khối học nào{statusFilter !== "all" ? " với trạng thái đã chọn" : ""}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DndContext>

          <div className="border-t border-border px-4 py-2.5 bg-muted/10 text-xs text-muted-foreground">
            Thứ tự khối học ảnh hưởng đến thứ tự hiển thị trong toàn bộ hệ thống (TKB, báo cáo, danh mục NCC).
          </div>
        </div>
      </div>
    </>
  );
}
