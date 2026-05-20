import { useState } from "react";
import {
  Video, Image as ImageIcon, Upload, Search, X,
  FileText, PlayCircle, Download, Trash2, Grid3x3, List,
} from "lucide-react";
import { stemPackages, STEM_IMAGES } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TierBadge } from "../ui/badges";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { toast } from "@/app/lib/toast";

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
  const [assets, setAssets] = useState(buildAssets());
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "document">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  /* Upload form */
  const [upType, setUpType] = useState<"image" | "video" | "document">("image");
  const [upTitle, setUpTitle] = useState("");
  const [upUrl, setUpUrl] = useState("");
  /* File chọn từ máy — File API */
  const [upFile, setUpFile] = useState<{ name: string; sizeMB: number; objectUrl: string } | null>(null);

  /* Map type → accept attribute cho file picker */
  const acceptByType: Record<typeof upType, string> = {
    image: "image/*",
    video: "video/*",
    document: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
  };

  const detectTypeFromFile = (file: File): typeof upType => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUpFile({
      name: file.name,
      sizeMB: +(file.size / (1024 * 1024)).toFixed(2),
      objectUrl,
    });
    /* Auto-fill: tên + loại theo file thực */
    if (!upTitle.trim()) setUpTitle(file.name);
    setUpType(detectTypeFromFile(file));
  };

  const resetUploadForm = () => {
    setUpTitle(""); setUpUrl(""); setUpFile(null);
  };

  const handleUpload = () => {
    if (upTitle.trim().length < 3) return;
    setAssets((prev) => [{
      id: `UP-${Date.now()}`,
      type: upType,
      title: upTitle.trim(),
      url: upFile?.objectUrl || upUrl.trim() || (upType === "image" ? STEM_IMAGES[0] : "/uploads/new"),
      sizeMB: upFile?.sizeMB ?? (upType === "video" ? 45 : upType === "document" ? 2.5 : 1.8),
      uploadedAt: new Date().toISOString(),
    }, ...prev]);
    toast.success(`Đã tải lên "${upTitle.trim()}"`);
    resetUploadForm();
    setUploadOpen(false);
  };

  /* Xóa — qua ConfirmDialog */
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.info(`Đã xóa "${deleteTarget.title}"`);
    setDeleteTarget(null);
  };

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
            onClick={() => setUploadOpen(true)}
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
                      onClick={() => setDeleteTarget(a)}
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
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toast.info(`Đang tải ${a.title}`)}
                          className="p-1.5 hover:bg-secondary rounded" title="Tải">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(a)}
                          className="p-1.5 hover:bg-secondary rounded" title="Xóa">
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-[#dc2626]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa media"
        message="Asset này sẽ bị xóa khỏi thư viện. Hành động không thể hoàn tác."
        itemName={deleteTarget?.title}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Upload dialog */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
              <Upload className="w-5 h-5 text-[#990803]" />
              <h2 className="flex-1" style={{ fontSize: "15px", fontWeight: 700 }}>Tải lên Media</h2>
              <button onClick={() => { resetUploadForm(); setUploadOpen(false); }} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>Loại media</label>
                <div className="flex gap-1.5">
                  {(Object.keys(TYPE_META) as Array<keyof typeof TYPE_META>).map((k) => {
                    const meta = TYPE_META[k];
                    const active = upType === k;
                    return (
                      <button key={k} onClick={() => setUpType(k)}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg border ${
                          active ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"
                        }`}
                        style={{ fontSize: "11.5px", fontWeight: 500, ...(active ? { backgroundColor: meta.color } : {}) }}>
                        <meta.icon className="w-3.5 h-3.5" /> {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vùng chọn file thật từ máy */}
              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Chọn file từ máy
                </label>
                {upFile ? (
                  <div className="flex items-center gap-2.5 p-2.5 bg-[#16a34a]/5 border border-[#16a34a]/30 rounded-lg">
                    {upType === "image" ? (
                      <img src={upFile.objectUrl} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center shrink-0">
                        {upType === "video"
                          ? <Video className="w-5 h-5 text-[#dc2626]" />
                          : <FileText className="w-5 h-5 text-[#c8a84e]" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{upFile.name}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                        {upFile.sizeMB} MB · đã đọc từ máy
                      </p>
                    </div>
                    <button onClick={() => setUpFile(null)}
                      className="p-1 text-muted-foreground hover:text-destructive shrink-0" title="Bỏ chọn">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center gap-1.5 py-5 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-[#990803]/40 hover:bg-secondary/40 transition-colors">
                    <Upload className="w-7 h-7 text-muted-foreground/50" />
                    <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>
                      Bấm để chọn file ({acceptByType[upType]})
                    </span>
                    <input
                      type="file"
                      accept={acceptByType[upType]}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Tên hiển thị <span className="text-[#990803]">*</span>
                </label>
                <input value={upTitle} onChange={(e) => setUpTitle(e.target.value)}
                  placeholder="VD: Brochure gói STEM 2026.pdf"
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
              </div>

              {/* URL — chỉ là cách thay thế nếu không chọn file */}
              {!upFile && (
                <div>
                  <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                    Hoặc dán URL (nếu không upload file)
                  </label>
                  <input value={upUrl} onChange={(e) => setUpUrl(e.target.value)}
                    placeholder="https://... (để trống dùng placeholder)"
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
              <button onClick={() => { resetUploadForm(); setUploadOpen(false); }}
                className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "12.5px" }}>
                Hủy
              </button>
              <button onClick={handleUpload} disabled={upTitle.trim().length < 3}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] disabled:opacity-40"
                style={{ fontSize: "12.5px", fontWeight: 600 }}>
                <Upload className="w-3.5 h-3.5" /> Tải lên
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaAssetManager;
