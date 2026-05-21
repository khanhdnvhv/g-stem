import { useState } from "react";
import { Link } from "react-router";
import { Network, ChevronRight, ChevronDown, Building2, School, Users } from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { MOCK_ORGS } from "./org-data";

/* ================================================================ */
/*  CÂY PHÂN CẤP HÀNH CHÍNH                                        */
/* ================================================================ */

function OrgNode({ soId, soName, province, expanded, onToggle }: {
  soId: string; soName: string; province?: string;
  expanded: boolean; onToggle: () => void;
}) {
  const truongs = MOCK_ORGS.filter((o) => o.type === "truong" && o.parentId === soId);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Sở header */}
      <button onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors text-left">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-blue-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px]">{soName}</p>
          {province && <p className="text-muted-foreground text-[11px]">{province}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <School className="w-3 h-3" /> {truongs.length} trường
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="w-3 h-3" />
            {MOCK_ORGS.find((o) => o.id === soId)?.userCount?.toLocaleString("vi-VN")}
          </span>
          {expanded
            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
            : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Trường con */}
      {expanded && truongs.length > 0 && (
        <div className="border-t border-border bg-secondary/20 divide-y divide-border/50">
          {truongs.map((t) => (
            <Link key={t.id} to={`/admin/organizations/${t.id}`}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-secondary/50 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 ml-1" />
              <div className="w-6 h-6 rounded-md bg-cyan-50 flex items-center justify-center shrink-0">
                <School className="w-3.5 h-3.5 text-cyan-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium truncate">{t.name}</p>
                <p className="text-muted-foreground text-[10.5px] font-mono">{t.code}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground">{t.userCount.toLocaleString("vi-VN")} thành viên</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              </div>
            </Link>
          ))}
          {/* Trường chưa có Sở */}
        </div>
      )}
      {expanded && truongs.length === 0 && (
        <div className="border-t border-border bg-secondary/10 px-5 py-3 text-[12px] text-muted-foreground italic">
          Chưa có trường nào thuộc địa bàn này
        </div>
      )}
    </div>
  );
}

export function OrgTree() {
  const soList = MOCK_ORGS.filter((o) => o.type === "so_gd");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(soList.map((s) => s.id)));

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const totalTruong = MOCK_ORGS.filter((o) => o.type === "truong").length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Network}
        title="Cây phân cấp hành chính"
        subtitle="Sơ đồ phân cấp Sở GD&ĐT → Trường học trực thuộc trên toàn hệ thống."
        accentColor="#1e40af"
        actions={
          <Link to="/admin/organizations"
            className="flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/70 rounded-lg transition-colors text-[13px] font-medium">
            Xem danh sách
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sở GD&ĐT",   value: soList.length,  color: "#1e40af" },
          { label: "Trường học",  value: totalTruong,    color: "#0e7490" },
          { label: "Chưa ghép Sở",
            value: MOCK_ORGS.filter((o) => o.type === "truong" && !o.parentId).length,
            color: "#b45309" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <p className="text-muted-foreground text-[11px]">{label}</p>
            <p className="font-bold text-[22px] mt-0.5" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button onClick={() => setExpanded(new Set(soList.map((s) => s.id)))}
          className="px-3 py-1.5 bg-secondary hover:bg-secondary/70 rounded-lg text-[12px] transition-colors">
          Mở tất cả
        </button>
        <button onClick={() => setExpanded(new Set())}
          className="px-3 py-1.5 bg-secondary hover:bg-secondary/70 rounded-lg text-[12px] transition-colors">
          Thu gọn tất cả
        </button>
      </div>

      {/* Tree */}
      <div className="space-y-3">
        {soList.map((so) => (
          <OrgNode key={so.id}
            soId={so.id} soName={so.name} province={so.province}
            expanded={expanded.has(so.id)}
            onToggle={() => toggle(so.id)}
          />
        ))}

        {/* Trường không thuộc Sở nào */}
        {(() => {
          const orphans = MOCK_ORGS.filter((o) => o.type === "truong" && !o.parentId);
          if (!orphans.length) return null;
          return (
            <div className="border border-amber-200 rounded-xl overflow-hidden bg-amber-50/30">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="font-semibold text-[13px] text-amber-800">Trường chưa ghép Sở</p>
                  <p className="text-[11px] text-amber-600">{orphans.length} trường</p>
                </div>
              </div>
              <div className="border-t border-amber-200 divide-y divide-amber-100">
                {orphans.map((t) => (
                  <Link key={t.id} to={`/admin/organizations/${t.id}`}
                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-amber-50 transition-colors">
                    <School className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-[12.5px] font-medium flex-1 truncate">{t.name}</span>
                    <span className="text-[11px] text-muted-foreground">{t.province}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
