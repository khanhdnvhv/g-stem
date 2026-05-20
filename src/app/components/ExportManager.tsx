import { useState } from "react";
import { toast } from "@/app/lib/toast";
import {
  Download, FileSpreadsheet, FileText, X, Check, Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  CSV / Excel Export Utility                                         */
/* ------------------------------------------------------------------ */

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: { key: string; label: string }[]
) {
  if (!data.length) {
    toast.warning("Không có dữ liệu để xuất");
    return;
  }

  const keys = columns ? columns.map((c) => c.key) : Object.keys(data[0]);
  const headers = columns ? columns.map((c) => c.label) : keys;

  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      keys
        .map((k) => {
          const val = row[k] ?? "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    ),
  ];

  const csvString = "\uFEFF" + csvRows.join("\n"); // BOM for Excel UTF-8
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
  toast.success(`Đã xuất ${data.length} dòng ra file ${filename}.csv`);
}

export function exportToJSON(
  data: unknown,
  filename: string
) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, `${filename}.json`);
  toast.success(`Đã xuất file ${filename}.json`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Export Modal Component                                             */
/* ------------------------------------------------------------------ */

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  format: "csv" | "json";
}

interface ExportManagerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  data: Record<string, unknown>[];
  columns?: { key: string; label: string }[];
  filename?: string;
}

export function ExportManagerModal({
  open,
  onClose,
  title = "Xuất dữ liệu",
  data,
  columns,
  filename = "geleximco-export",
}: ExportManagerProps) {
  const [exporting, setExporting] = useState(false);
  const [completed, setCompleted] = useState<string | null>(null);

  const options: ExportOption[] = [
    {
      id: "csv",
      label: "CSV / Excel",
      description: "File CSV tương thích Microsoft Excel, Google Sheets",
      icon: FileSpreadsheet,
      format: "csv",
    },
    {
      id: "json",
      label: "JSON",
      description: "Định dạng JSON cho tích hợp hệ thống",
      icon: FileText,
      format: "json",
    },
  ];

  const handleExport = async (opt: ExportOption) => {
    setExporting(true);
    setCompleted(null);

    // Simulate brief processing
    await new Promise((r) => setTimeout(r, 600));

    if (opt.format === "csv") {
      exportToCSV(data, filename, columns);
    } else {
      exportToJSON(data, filename);
    }

    setCompleted(opt.id);
    setExporting(false);

    setTimeout(() => {
      setCompleted(null);
      onClose();
    }, 1000);
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-[#990803]" />
              <span style={{ fontSize: "15px", fontWeight: 600 }}>
                {title}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-secondary text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="px-5 py-3 bg-secondary/30 border-b border-border">
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
              {data.length.toLocaleString()} bản ghi sẵn sàng xuất
            </p>
          </div>

          {/* Export Options */}
          <div className="p-4 space-y-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleExport(opt)}
                disabled={exporting}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left cursor-pointer ${
                  completed === opt.id
                    ? "border-green-300 bg-green-50"
                    : "border-border hover:border-[#990803]/30 hover:bg-[#990803]/5"
                } ${exporting && completed !== opt.id ? "opacity-50" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    completed === opt.id
                      ? "bg-green-100 text-green-600"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {completed === opt.id ? (
                    <Check className="w-5 h-5" />
                  ) : exporting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <opt.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={
                      completed === opt.id ? "text-green-700" : "text-foreground"
                    }
                    style={{ fontSize: "14px", fontWeight: 500 }}
                  >
                    {completed === opt.id ? "Đã xuất thành công!" : opt.label}
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "12px" }}
                  >
                    {opt.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
