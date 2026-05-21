import { useState } from "react";
import {
  Plus, Pencil, EyeOff, Eye, Check, X, AlertTriangle, Hash, Cpu, FileText, ChevronRight, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

/* ── Types ─────────────────────────────────────────────── */

type CatalogKey = "units" | "deviceTypes" | "contractTypes";

interface CatalogItem {
  id: string;
  catalogKey: CatalogKey;
  name: string;
  code: string;
  description: string;
  status: "active" | "hidden";
  createdAt: string;
}

interface RowState { name: string; code: string; description: string; codeError: string; codeEdited?: boolean; }

/* ── Config ─────────────────────────────────────────────── */

const TABS: Array<{ key: CatalogKey; label: string; icon: LucideIcon; desc: string }> = [
  { key: "units",         label: "Đơn vị tính",   icon: Hash,     desc: "Đơn vị đo lường cho thiết bị và học liệu trong BOM" },
  { key: "deviceTypes",   label: "Loại thiết bị", icon: Cpu,      desc: "Phân loại thiết bị và vật tư trong gói phòng STEM" },
  { key: "contractTypes", label: "Loại hợp đồng", icon: FileText, desc: "Phân loại hợp đồng ký với trường học và đại lý" },
];

/* ── Mock data ──────────────────────────────────────────── */

const INITIAL_ITEMS: CatalogItem[] = [
  { id:"U-01",  catalogKey:"units",         name:"Cái",               code:"CAI",   description:"",                                    status:"active", createdAt:"2024-01-10" },
  { id:"U-02",  catalogKey:"units",         name:"Bộ",                code:"BO",    description:"Nhiều linh kiện thành một bộ",         status:"active", createdAt:"2024-01-10" },
  { id:"U-03",  catalogKey:"units",         name:"Chiếc",             code:"CHIEC", description:"",                                    status:"active", createdAt:"2024-01-10" },
  { id:"U-04",  catalogKey:"units",         name:"Cuốn",              code:"CUON",  description:"Sách, tài liệu in",                   status:"active", createdAt:"2024-01-10" },
  { id:"U-05",  catalogKey:"units",         name:"Hộp",               code:"HOP",   description:"",                                    status:"active", createdAt:"2024-01-10" },
  { id:"U-06",  catalogKey:"units",         name:"Gói",               code:"GOI",   description:"",                                    status:"active", createdAt:"2024-01-10" },
  { id:"U-07",  catalogKey:"units",         name:"Kilogram",          code:"KG",    description:"",                                    status:"active", createdAt:"2024-01-10" },
  { id:"U-08",  catalogKey:"units",         name:"Mét",               code:"M",     description:"",                                    status:"active", createdAt:"2024-01-10" },
  { id:"U-09",  catalogKey:"units",         name:"m²",                code:"M2",    description:"Diện tích mặt bằng",                  status:"active", createdAt:"2024-01-10" },
  { id:"U-10",  catalogKey:"units",         name:"Lít",               code:"L",     description:"",                                    status:"active", createdAt:"2024-01-10" },
  { id:"U-11",  catalogKey:"units",         name:"License",           code:"LIC",   description:"Giấy phép phần mềm",                  status:"active", createdAt:"2024-01-10" },
  { id:"D-01",  catalogKey:"deviceTypes",   name:"Thiết bị cứng STEM",code:"TBC",   description:"Robot, cảm biến, mạch điện tử",       status:"active", createdAt:"2024-01-10" },
  { id:"D-02",  catalogKey:"deviceTypes",   name:"Phần mềm",          code:"PM",    description:"Phần mềm học tập và quản lý",          status:"active", createdAt:"2024-01-10" },
  { id:"D-03",  catalogKey:"deviceTypes",   name:"Học liệu số",       code:"HLS",   description:"Video, slide, tài liệu PDF",           status:"active", createdAt:"2024-01-10" },
  { id:"D-04",  catalogKey:"deviceTypes",   name:"Robot & Coding",    code:"RC",    description:"Robot lập trình, kit coding",          status:"active", createdAt:"2024-01-10" },
  { id:"D-05",  catalogKey:"deviceTypes",   name:"Cảm biến & IoT",    code:"IOT",   description:"Module cảm biến, thiết bị kết nối",   status:"active", createdAt:"2024-01-10" },
  { id:"D-06",  catalogKey:"deviceTypes",   name:"Nội thất phòng STEM",code:"NT",   description:"Bàn ghế, tủ, giá đỡ chuyên dụng",    status:"active", createdAt:"2024-01-10" },
  { id:"D-07",  catalogKey:"deviceTypes",   name:"Phụ kiện & Vật tư", code:"PK",    description:"Dây, đầu nối, vật tư thay thế định kỳ",status:"active", createdAt:"2024-01-10" },
  { id:"D-08",  catalogKey:"deviceTypes",   name:"Máy tính & Màn hình",code:"MTMH", description:"PC, laptop, màn hình, máy chiếu",     status:"hidden", createdAt:"2024-01-10" },
  { id:"C-01",  catalogKey:"contractTypes", name:"Mua đứt",           code:"MD",    description:"Mua bán hàng hóa một lần, chuyển quyền sở hữu", status:"active", createdAt:"2024-01-10" },
  { id:"C-02",  catalogKey:"contractTypes", name:"Thuê dịch vụ năm",  code:"TDN",   description:"Dịch vụ thanh toán định kỳ theo năm",  status:"active", createdAt:"2024-01-10" },
  { id:"C-03",  catalogKey:"contractTypes", name:"Thuê theo dự án",   code:"TDA",   description:"Hợp đồng dự án có thời hạn cố định",   status:"active", createdAt:"2024-01-10" },
  { id:"C-04",  catalogKey:"contractTypes", name:"Dùng thử",          code:"DT",    description:"Hợp đồng dùng thử miễn phí có thời hạn",status:"active", createdAt:"2024-01-10" },
  { id:"C-05",  catalogKey:"contractTypes", name:"Bảo trì & Hỗ trợ", code:"BT",    description:"Hợp đồng bảo trì sau bán hàng",        status:"active", createdAt:"2024-01-10" },
];

/* ── Helpers ────────────────────────────────────────────── */

function autoCode(name: string) {
  return name.split(/\s+/).filter(Boolean)
    .map(w => w[0]?.toUpperCase() ?? "").join("")
    .replace(/[^A-Z0-9]/g, "").slice(0, 6)
    || name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeCode(v: string) { return v.toUpperCase().replace(/[^A-Z0-9_]/g, ""); }

function StatusBadge({ status }: { status: CatalogItem["status"] }) {
  return status === "active"
    ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Hiển thị</span>
    : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Ẩn</span>;
}

const IC = "px-2 py-1 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
const IE = "px-2 py-1 rounded border border-red-400 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-300";

/* ── HideModal ──────────────────────────────────────────── */

function HideModal({ item, onConfirm, onClose }: { item: CatalogItem; onConfirm: () => void; onClose: () => void }) {
  const isHiding = item.status === "active";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-base font-semibold">{isHiding ? "Ẩn mục danh mục?" : "Hiển thị lại?"}</h2>
            <p className="text-sm text-muted-foreground mt-0.5"><strong>{item.name}</strong></p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {isHiding ? "Mục này sẽ không hiển thị để lựa chọn khi tạo mới dữ liệu." : "Mục này sẽ hiển thị trở lại trong toàn bộ hệ thống."}
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

/* ── CatalogTable ───────────────────────────────────────── */

function CatalogTable({
  items, catalogKey,
  onHide,
}: {
  items: CatalogItem[];
  catalogKey: CatalogKey;
  onHide: (item: CatalogItem) => void;
}) {
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editState, setEditState]   = useState<RowState>({ name: "", code: "", description: "", codeError: "" });
  const [isAdding, setIsAdding]     = useState(false);
  const [addState, setAddState]     = useState<RowState>({ name: "", code: "", description: "", codeError: "", codeEdited: false });
  const [allItems, setAllItems]     = useState<CatalogItem[]>(items);

  // sync when parent items change (tab switch)
  const visibleItems = allItems.filter(i => i.catalogKey === catalogKey);
  const allCodes     = (excludeId?: string) => allItems.filter(i => i.catalogKey === catalogKey && i.id !== excludeId).map(i => i.code);

  const handleStartEdit = (item: CatalogItem) => {
    setIsAdding(false);
    setEditingId(item.id);
    setEditState({ name: item.name, code: item.code, description: item.description, codeError: "" });
  };

  const handleSaveEdit = () => {
    if (!editState.name.trim() || !editState.code.trim()) return;
    if (allCodes(editingId!).includes(editState.code)) { setEditState(s => ({ ...s, codeError: "Mã đã tồn tại" })); return; }
    setAllItems(prev => prev.map(i => i.id === editingId ? { ...i, name: editState.name.trim(), code: editState.code, description: editState.description.trim() } : i));
    toast.success(`Đã cập nhật "${editState.name}"`);
    setEditingId(null);
  };

  const handleAddNameChange = (name: string) => {
    setAddState(s => ({ ...s, name, code: s.codeEdited ? s.code : normalizeCode(autoCode(name)), codeError: "" }));
  };

  const handleSaveAdd = () => {
    if (!addState.name.trim() || !addState.code.trim()) return;
    if (allCodes().includes(addState.code)) { setAddState(s => ({ ...s, codeError: "Mã đã tồn tại" })); return; }
    const newItem: CatalogItem = {
      id: `${catalogKey}-${Date.now()}`,
      catalogKey,
      name: addState.name.trim(),
      code: addState.code,
      description: addState.description.trim(),
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAllItems(prev => [newItem, ...prev]);
    toast.success(`Đã thêm "${newItem.name}"`);
    setIsAdding(false);
  };

  const handleHideFromTable = (item: CatalogItem) => {
    // Optimistic: update local state after parent confirms
    onHide(item);
  };

  // sync hide/show from parent back to local state
  const syncStatus = (id: string, status: "active" | "hidden") => {
    setAllItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  // expose syncStatus through a ref approach — simpler: just track hide locally too
  const handleLocalHide = (item: CatalogItem) => {
    const newStatus = item.status === "active" ? "hidden" : "active";
    setAllItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
    newStatus === "hidden" ? toast.info(`Đã ẩn "${item.name}"`) : toast.success(`Đã hiển thị lại "${item.name}"`);
  };

  const startAdd = () => {
    setEditingId(null);
    setAddState({ name: "", code: "", description: "", codeError: "", codeEdited: false });
    setIsAdding(true);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <p className="text-sm font-medium text-muted-foreground">{visibleItems.length} mục</p>
        <button onClick={startAdd} disabled={isAdding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
          <Plus size={13} /> Thêm mục
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-12">STT</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Tên</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Mã</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Mô tả</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Trạng thái</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-28">Ngày tạo</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground w-24">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {/* Inline add row */}
          {isAdding && (
            <tr className="border-b border-border bg-green-50/30 dark:bg-green-950/20">
              <td className="py-2 px-4 text-sm text-muted-foreground">—</td>
              <td className="py-2 px-2">
                <input value={addState.name} onChange={e => handleAddNameChange(e.target.value)}
                  className={`w-full ${IC}`} placeholder="Tên *" autoFocus />
              </td>
              <td className="py-2 px-2">
                <input value={addState.code}
                  onChange={e => setAddState(s => ({ ...s, code: normalizeCode(e.target.value), codeError: "", codeEdited: true }))}
                  className={`w-24 font-mono ${addState.codeError ? IE : IC}`} placeholder="Mã *" />
                {addState.codeError && <p className="text-xs text-red-500 mt-0.5">{addState.codeError}</p>}
              </td>
              <td className="py-2 px-2">
                <input value={addState.description} onChange={e => setAddState(s => ({ ...s, description: e.target.value }))}
                  className={`w-full ${IC}`} placeholder="Mô tả (tuỳ chọn)" />
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

          {visibleItems.map((item, idx) => editingId === item.id ? (
            <tr key={item.id} className="border-b border-border bg-blue-50/40 dark:bg-blue-950/20">
              <td className="py-2 px-4 text-sm text-muted-foreground">{idx + 1}</td>
              <td className="py-2 px-2">
                <input value={editState.name} onChange={e => setEditState(s => ({ ...s, name: e.target.value }))}
                  className={`w-full ${IC}`} placeholder="Tên *" />
              </td>
              <td className="py-2 px-2">
                <input value={editState.code} onChange={e => setEditState(s => ({ ...s, code: normalizeCode(e.target.value), codeError: "" }))}
                  className={`w-24 font-mono ${editState.codeError ? IE : IC}`} placeholder="Mã *" />
                {editState.codeError && <p className="text-xs text-red-500 mt-0.5">{editState.codeError}</p>}
              </td>
              <td className="py-2 px-2">
                <input value={editState.description} onChange={e => setEditState(s => ({ ...s, description: e.target.value }))}
                  className={`w-full ${IC}`} placeholder="Mô tả" />
              </td>
              <td className="py-2 px-4"><StatusBadge status={item.status} /></td>
              <td className="py-2 px-4 text-xs text-muted-foreground">{item.createdAt}</td>
              <td className="py-2 px-3">
                <div className="flex items-center gap-1">
                  <button onClick={handleSaveEdit} disabled={!editState.name.trim() || !editState.code.trim()}
                    className="p-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors" title="Lưu">
                    <Check size={13} />
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground" title="Huỷ">
                    <X size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4 text-sm text-muted-foreground">{idx + 1}</td>
              <td className="py-3 px-4 font-medium text-sm">{item.name}</td>
              <td className="py-3 px-4"><code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{item.code}</code></td>
              <td className="py-3 px-4 text-sm text-muted-foreground">{item.description || <span className="italic opacity-50">—</span>}</td>
              <td className="py-3 px-4"><StatusBadge status={item.status} /></td>
              <td className="py-3 px-4 text-xs text-muted-foreground">{item.createdAt}</td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => handleStartEdit(item)}
                    className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Chỉnh sửa">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleLocalHide(item)}
                    className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title={item.status === "active" ? "Ẩn" : "Hiển thị lại"}>
                    {item.status === "active" ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {visibleItems.length === 0 && !isAdding && (
            <tr>
              <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Chưa có mục nào. Nhấn "+ Thêm mục" để bắt đầu.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

export function MiscAdmin() {
  const [selected, setSelected] = useState<CatalogKey | null>(null);
  const cfg = selected ? TABS.find(t => t.key === selected)! : null;
  const countOf = (key: CatalogKey) => INITIAL_ITEMS.filter(i => i.catalogKey === key).length;

  /* ── Detail view ── */
  if (selected && cfg) {
    const Icon = cfg.icon;
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} /> Danh mục khác
          </button>
          <ChevronRight size={14} className="text-muted-foreground" />
          <div className="flex items-center gap-1.5">
            <Icon size={15} className="text-primary" />
            <span className="text-sm font-medium">{cfg.label}</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-semibold">{cfg.label}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{cfg.desc}</p>
        </div>

        <CatalogTable key={selected} items={INITIAL_ITEMS} catalogKey={selected} onHide={() => {}} />
      </div>
    );
  }

  /* ── Card grid view ── */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Danh mục khác</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Quản lý các danh mục dùng chung trong hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const count = countOf(tab.key);
          return (
            <button key={tab.key} onClick={() => setSelected(tab.key)}
              className="group text-left bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon size={20} className="text-primary" />
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1" />
              </div>
              <p className="font-semibold text-sm mb-1">{tab.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tab.desc}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{count} mục</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
