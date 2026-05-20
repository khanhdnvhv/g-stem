import { useState, useMemo } from "react";
import {
  Layers, Plus, Search, Pencil, Trash2, Download,
  BookOpen, GraduationCap, School as SchoolIcon, Target,
} from "lucide-react";
import { catalogs } from "../../mock-data/index";
import type { CatalogItem } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  COMMON CATALOG MANAGER — Danh mục dùng chung                    */
/* ================================================================ */

const CATALOG_META: Record<CatalogItem["catalog"], { label: string; color: string; icon: typeof BookOpen }> = {
  subject: { label: "Môn học",       color: "#2563eb", icon: BookOpen },
  grade:   { label: "Cấp học",       color: "#7c3aed", icon: GraduationCap },
  school:  { label: "Trường học",    color: "#c8a84e", icon: SchoolIcon },
  skill:   { label: "Chuẩn kỹ năng", color: "#16a34a", icon: Target },
  program: { label: "Chương trình",  color: "#dc2626", icon: BookOpen },
};

export function CommonCatalogManager() {
  const [activeCatalog, setActiveCatalog] = useState<CatalogItem["catalog"]>("subject");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    catalogs.filter((c) => c.catalog === activeCatalog &&
      (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))),
    [activeCatalog, search]
  );

  const countByType = useMemo(() => {
    const m: Record<string, number> = {};
    catalogs.forEach((c) => { m[c.catalog] = (m[c.catalog] || 0) + 1; });
    return m;
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Layers}
        title="Danh mục dùng chung"
        subtitle="Quản lý và chuẩn hóa các danh mục dữ liệu dùng chung đảm bảo tính thống nhất trong toàn hệ thống."
        accentColor="#7c3aed"
        actions={
          <>
            <button onClick={() => toast.success("Thêm mục mới vào danh mục")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Thêm mục
            </button>
            <button onClick={() => toast.info("Xuất danh mục JSON cho đối tác tích hợp")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất JSON
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(CATALOG_META) as Array<keyof typeof CATALOG_META>).map((k) => {
          const meta = CATALOG_META[k];
          return (
            <KpiCard key={k} icon={meta.icon} label={meta.label} value={countByType[k] || 0} color={meta.color} />
          );
        })}
      </div>

      {/* Catalog tabs */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto">
        {(Object.keys(CATALOG_META) as Array<keyof typeof CATALOG_META>).map((k) => {
          const meta = CATALOG_META[k];
          const active = activeCatalog === k;
          const Icon = meta.icon;
          return (
            <button key={k} onClick={() => setActiveCatalog(k)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                active ? "text-white shadow-sm" : "hover:bg-secondary"
              }`}
              style={{
                fontSize: "12.5px", fontWeight: active ? 600 : 500,
                ...(active ? { backgroundColor: meta.color } : {}),
              }}>
              <Icon className="w-3.5 h-3.5" />
              {meta.label} ({countByType[k] || 0})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={`Tìm ${CATALOG_META[activeCatalog].label.toLowerCase()}...`}
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "13px" }} />
      </div>

      {/* List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Mã</th>
              <th className="px-4 py-2.5">Tên</th>
              <th className="px-4 py-2.5">Danh mục</th>
              <th className="px-4 py-2.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-mono" style={{ fontSize: "11.5px", fontWeight: 600 }}>{c.code}</td>
                <td className="px-4 py-3" style={{ fontWeight: 500 }}>{c.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style={{
                    fontSize: "10.5px", fontWeight: 600,
                    color: CATALOG_META[c.catalog].color,
                    backgroundColor: CATALOG_META[c.catalog].color + "15",
                  }}>
                    {CATALOG_META[c.catalog].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toast.info(`Sửa ${c.name}`)}
                    className="p-1.5 hover:bg-secondary rounded" title="Sửa">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => toast.error(`Xóa ${c.name}`)}
                    className="p-1.5 hover:bg-secondary rounded ml-1" title="Xóa">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
            Danh mục trống.
          </div>
        )}
      </div>
    </div>
  );
}

export default CommonCatalogManager;
