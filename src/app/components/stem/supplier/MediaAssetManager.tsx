import { useState } from "react";
import {
  Video, Image as ImageIcon, Upload, Search, Filter,
  FileText, PlayCircle, Download, Trash2, Grid3x3, List,
} from "lucide-react";
import { stemPackages, STEM_IMAGES } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TierBadge } from "../ui/badges";
import { toast } from "sonner";

/* ================================================================ */
/*  MEDIA ASSET MANAGER — ảnh, video demo, tài liệu truyền thông    */
/* ================================================================ */

interface MediaAsset {
  id: string;
  type: "image" | "video" | "document";
  title: string;
  url: string;
  packageId?: string;
  sizeMB: number;
  uploadedAt: string;
}

// Sinh media assets từ packages + thêm docs
function buildAssets(): MediaAsset[] {
  const assets: MediaAsset[] = [];
  stemPackages.forEach((pkg) => {
    pkg.thumbnails.forEach((url, i) => {
      assets.push({
        id: `${pkg.id}-IMG-${i}`,
        type: "image",
        title: `${pkg.name} — Ảnh ${i + 1}`,
        url,
        packageId: pkg.id,
        sizeMB: 1.2 + i * 0.4,
        uploadedAt: pkg.publishedAt,
      });
    });
    if (pkg.demoVideoUrl) {
      assets.push({
        id: `${pkg.id}-VID`,
        type: "video",
        title: `${pkg.name} — Demo video`,
        url: pkg.demoVideoUrl,
        packageId: pkg.id,
        sizeMB: 68.5,
        uploadedAt: pkg.publishedAt,
      });
    }
  });
  // Thêm vài tài liệu truyền thông
  [
    "Brochure Giải pháp STEM Geleximco 2026.pdf",
    "Tài liệu giới thiệu 5 chương trình CT1-CT5.pdf",
    "Catalogue phòng Lab STEM Nâng cao.pdf",
    "Giới thiệu AI-Buddy cho giáo viên.pdf",
  ].forEach((t, i) => {
    assets.push({
      id: `DOC-${i + 1}`,
      type: "document",
      title: t,
      url: `/docs/${i + 1}.pdf`,
      sizeMB: 4.3 + i,
      uploadedAt: "2025-11-10T00:00:00Z",
    });
  });
  // Thêm vài ảnh STEM phòng học
  STEM_IMAGES.slice(0, 4).forEach((url, i) => {
    assets.push({
      id: `GAL-${i + 1}`,
      type: "image",
      title: `Ảnh phòng học mẫu #${i + 1}`,
      url,
      sizeMB: 2.1 + i * 0.3,
      uploadedAt: "2025-12-15T00:00:00Z",
    });
  });
  return assets;
}

const TYPE_META = {
  image:    { icon: ImageIcon, label: "Ảnh",       color: "#0891b2" },
  video:    { icon: Video,     label: "Video",     color: "#dc2626" },
  document: { icon: FileText,  label: "Tài liệu",  color: "#c8a84e" },
} as const;

export function MediaAssetManager() {
  const [assets] = useState(buildAssets());
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "document">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const filtered = assets.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statsByType = {
    image:    assets.filter((a) => a.type === "image").length,
    video:    assets.filter((a) => a.type === "video").length,
    document: assets.filter((a) => a.type === "document").length,
  };
  const totalSize = assets.reduce((s, a) => s + a.sizeMB, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Video}
        title="Thư viện Media"
        subtitle="Quản lý ảnh, video demo, tài liệu truyền thông cho các gói phòng STEM"
        actions={
          <button
            onClick={() => toast.success("Mở hộp thoại upload — accept ảnh/video/PDF")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Upload className="w-4 h-4" />
            Tải lên
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tổng số asset</p>
          <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{assets.length}</p>
        </div>
        {(Object.keys(statsByType) as Array<keyof typeof statsByType>).map((k) => {
          const meta = TYPE_META[k];
          return (
            <div key={k} className="bg-card rounded-lg border border-border p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "11px" }}>
                <meta.icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                {meta.label}
              </div>
              <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{statsByType[k]}</p>
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm asset..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <button
          onClick={() => setTypeFilter("all")}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            typeFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
          }`}
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Tất cả
        </button>
        {(Object.keys(TYPE_META) as Array<keyof typeof TYPE_META>).map((k) => {
          const meta = TYPE_META[k];
          const isActive = typeFilter === k;
          return (
            <button
              key={k}
              onClick={() => setTypeFilter(k)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors ${
                isActive ? "text-white" : "bg-card border-border hover:bg-secondary"
              }`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(isActive ? { backgroundColor: meta.color, borderColor: meta.color } : {}),
              }}
            >
              <meta.icon className="w-3.5 h-3.5" />
              {meta.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-secondary" : ""}`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-secondary" : ""}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
        {filtered.length} asset · Tổng dung lượng: {totalSize.toFixed(1)} MB
      </p>

      {/* Grid view */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((a) => {
            const meta = TYPE_META[a.type];
            const pkg = a.packageId ? stemPackages.find((p) => p.id === a.packageId) : null;
            return (
              <div
                key={a.id}
                className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="aspect-video bg-secondary relative overflow-hidden">
                  {a.type === "image" ? (
                    <img src={a.url} alt={a.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full" style={{ background: `${meta.color}15` }}>
                      <meta.icon className="w-8 h-8" style={{ color: meta.color }} />
                    </div>
                  )}
                  {a.type === "video" && (
                    <PlayCircle className="absolute top-2 right-2 w-6 h-6 text-white drop-shadow-md" />
                  )}
                  <div className="absolute top-2 left-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-white"
                      style={{ fontSize: "9px", fontWeight: 600, backgroundColor: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => toast.info(`Tải ${a.title}`)}
                      className="p-2 bg-white rounded-full hover:scale-110 transition-transform"
                      title="Tải"
                    >
                      <Download className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                      onClick={() => toast.error(`Yêu cầu xóa ${a.title}`)}
                      className="p-2 bg-white rounded-full hover:scale-110 transition-transform"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4 text-[#dc2626]" />
                    </button>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-foreground truncate" style={{ fontSize: "11.5px", fontWeight: 500 }} title={a.title}>
                    {a.title}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
                      {a.sizeMB.toFixed(1)} MB
                    </span>
                    {pkg && <TierBadge tier={pkg.tier} size="xs" showName={false} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr className="text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                <th className="px-4 py-2">Tên</th>
                <th className="px-4 py-2">Loại</th>
                <th className="px-4 py-2">Gói</th>
                <th className="px-4 py-2">Dung lượng</th>
                <th className="px-4 py-2">Ngày tải</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((a) => {
                const meta = TYPE_META[a.type];
                const pkg = a.packageId ? stemPackages.find((p) => p.id === a.packageId) : null;
                return (
                  <tr key={a.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <meta.icon className="w-4 h-4" style={{ color: meta.color }} />
                        <span style={{ fontSize: "12.5px" }}>{a.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5" style={{ fontSize: "12px" }}>{meta.label}</td>
                    <td className="px-4 py-2.5">{pkg && <TierBadge tier={pkg.tier} size="xs" />}</td>
                    <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "12px" }}>{a.sizeMB.toFixed(1)} MB</td>
                    <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "12px" }}>{a.uploadedAt.split("T")[0]}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button className="p-1.5 hover:bg-secondary rounded" title="Tải">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MediaAssetManager;
