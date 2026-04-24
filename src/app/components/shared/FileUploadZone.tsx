import { useState, useRef, useCallback } from "react";
import {
  Upload, X, FileText, Video, Image, File, Headphones,
  CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";

// ─── Types ───
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number; // 0-100
  status: "uploading" | "done" | "error";
  errorMsg?: string;
}

interface FileUploadZoneProps {
  onFilesReady?: (files: UploadedFile[]) => void;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  compact?: boolean;
}

const ICON_MAP: Record<string, typeof FileText> = {
  "application/pdf": FileText,
  "video/mp4": Video,
  "video/webm": Video,
  "audio/mpeg": Headphones,
  "audio/wav": Headphones,
  "image/png": Image,
  "image/jpeg": Image,
  "image/webp": Image,
};

function getFileIcon(mimeType: string) {
  for (const [prefix, icon] of Object.entries(ICON_MAP)) {
    if (mimeType.startsWith(prefix)) return icon;
  }
  return File;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function FileUploadZone({
  onFilesReady,
  accept = ".pdf,.docx,.pptx,.xlsx,.mp4,.mp3,.png,.jpg,.jpeg,.zip,.scorm",
  maxSizeMB = 500,
  maxFiles = 5,
  compact = false,
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const simulateUpload = useCallback((file: UploadedFile) => {
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => {
          const updated = prev.map(f =>
            f.id === file.id ? { ...f, progress: 100, status: "done" as const } : f
          );
          // Notify parent when all done
          if (updated.every(f => f.status === "done" || f.status === "error")) {
            onFilesReady?.(updated.filter(f => f.status === "done"));
          }
          return updated;
        });
      } else {
        setFiles(prev =>
          prev.map(f => (f.id === file.id ? { ...f, progress: Math.min(progress, 99) } : f))
        );
      }
    }, 200 + Math.random() * 300);
  }, [onFilesReady]);

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const newFiles: UploadedFile[] = [];
      const maxBytes = maxSizeMB * 1024 * 1024;

      for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
        const f = fileList[i];
        const id = `up_${Date.now()}_${i}`;
        if (f.size > maxBytes) {
          newFiles.push({
            id,
            name: f.name,
            size: f.size,
            type: f.type,
            progress: 0,
            status: "error",
            errorMsg: `Vượt quá ${maxSizeMB}MB`,
          });
        } else {
          newFiles.push({
            id,
            name: f.name,
            size: f.size,
            type: f.type,
            progress: 0,
            status: "uploading",
          });
        }
      }
      setFiles(prev => [...prev, ...newFiles]);
      // Start simulated uploads
      newFiles.filter(f => f.status === "uploading").forEach(f => simulateUpload(f));
    },
    [files.length, maxFiles, maxSizeMB, simulateUpload]
  );

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // ─── Drag Events ───
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const hasFiles = files.length > 0;
  const allDone = files.length > 0 && files.every(f => f.status === "done" || f.status === "error");
  const uploading = files.some(f => f.status === "uploading");
  const totalProgress =
    files.length > 0
      ? Math.round(files.reduce((s, f) => s + f.progress, 0) / files.length)
      : 0;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl text-center transition-all cursor-pointer
          ${compact ? "p-4" : "p-8"}
          ${isDragging
            ? "border-[#990803] bg-[#990803]/5 scale-[1.01]"
            : "border-border hover:border-[#990803]/30 hover:bg-secondary/30"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={e => {
            processFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {isDragging ? (
          <>
            <Upload className="w-10 h-10 text-[#990803] mx-auto animate-bounce" />
            <p className="text-[#990803] mt-2" style={{ fontSize: "14px", fontWeight: 600 }}>
              Thả file vào đây!
            </p>
          </>
        ) : (
          <>
            <Upload
              className={`mx-auto text-muted-foreground/30 ${compact ? "w-6 h-6" : "w-8 h-8"}`}
            />
            <p
              className="text-muted-foreground mt-2"
              style={{ fontSize: compact ? "12px" : "13px" }}
            >
              Kéo & thả file vào đây hoặc{" "}
              <span className="text-[#990803]" style={{ fontWeight: 500 }}>
                chọn file
              </span>
            </p>
            <p className="text-muted-foreground/50 mt-1" style={{ fontSize: "10px" }}>
              PDF, DOCX, PPTX, MP4, MP3, SCORM — Tối đa {maxSizeMB}MB — Tối đa {maxFiles} file
            </p>
          </>
        )}
      </div>

      {/* Overall progress bar (when uploading) */}
      {uploading && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span
              className="text-muted-foreground flex items-center gap-1.5"
              style={{ fontSize: "11px" }}
            >
              <Loader2 className="w-3 h-3 animate-spin text-[#990803]" />
              Đang tải lên... {totalProgress}%
            </span>
            <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
              {files.filter(f => f.status === "done").length}/{files.length} hoàn thành
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-[#990803] rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File list */}
      {hasFiles && (
        <div className="space-y-1.5">
          {files.map(f => {
            const FIcon = getFileIcon(f.type);
            return (
              <div
                key={f.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  f.status === "error"
                    ? "border-red-200 bg-red-50/50"
                    : f.status === "done"
                    ? "border-[#16a34a]/20 bg-[#16a34a]/[0.03]"
                    : "border-border bg-secondary/20"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    f.status === "error" ? "bg-red-100" : "bg-secondary"
                  }`}
                >
                  <FIcon
                    className="w-4 h-4"
                    style={{
                      color:
                        f.status === "error"
                          ? "#dc2626"
                          : f.status === "done"
                          ? "#16a34a"
                          : "#6b7280",
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-foreground truncate"
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      {f.name}
                    </span>
                    <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>
                      {formatBytes(f.size)}
                    </span>
                  </div>

                  {/* Progress bar per file */}
                  {f.status === "uploading" && (
                    <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#990803] rounded-full transition-all duration-300"
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                  )}
                  {f.status === "error" && (
                    <p className="text-red-500 mt-0.5" style={{ fontSize: "10px" }}>
                      {f.errorMsg || "Lỗi tải lên"}
                    </p>
                  )}
                </div>

                {/* Status / Remove */}
                <div className="shrink-0 flex items-center gap-1">
                  {f.status === "uploading" && (
                    <span className="text-[#990803]" style={{ fontSize: "10px", fontWeight: 600 }}>
                      {Math.round(f.progress)}%
                    </span>
                  )}
                  {f.status === "done" && (
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  )}
                  {f.status === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      removeFile(f.id);
                    }}
                    className="p-1 rounded hover:bg-secondary cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All done summary */}
      {allDone && files.length > 0 && (
        <div className="flex items-center justify-between p-2.5 bg-[#16a34a]/5 rounded-lg border border-[#16a34a]/10">
          <span
            className="text-[#16a34a] flex items-center gap-1.5"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            <CheckCircle2 className="w-4 h-4" />
            {files.filter(f => f.status === "done").length} file đã tải lên thành công
            {files.some(f => f.status === "error") &&
              ` • ${files.filter(f => f.status === "error").length} file lỗi`}
          </span>
          <button
            onClick={() => setFiles([])}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            style={{ fontSize: "11px" }}
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}
