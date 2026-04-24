import { useState } from "react";
import {
  FileText, Download, Calendar, Filter, CheckCircle2,
  History, FileType,
} from "lucide-react";
import { MINISTRY_REPORT_TEMPLATES, authorityReports } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatDateTime, formatRelative } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  MINISTRY REPORT EXPORTER — Kết xuất báo cáo theo Thông tư        */
/* ================================================================ */

const SCOPES = ["district", "province", "national"] as const;
const SCOPE_LABEL: Record<typeof SCOPES[number], string> = {
  district: "Quận/Huyện",
  province: "Tỉnh/TP",
  national: "Quốc gia",
};

const PERIODS = ["Q1/2026", "Q2/2026", "Q3/2026", "Q4/2025", "Năm học 2025-2026"];
const FORMATS = ["PDF", "Excel", "Word"] as const;

export function MinistryReportExporter() {
  const [selectedTemplate, setSelectedTemplate] = useState(MINISTRY_REPORT_TEMPLATES[0].code);
  const [scope, setScope] = useState<typeof SCOPES[number]>("province");
  const [period, setPeriod] = useState(PERIODS[0]);
  const [format, setFormat] = useState<typeof FORMATS[number]>("PDF");

  const template = MINISTRY_REPORT_TEMPLATES.find((t) => t.code === selectedTemplate);

  const handleGenerate = () => {
    toast.success(`Đã tạo báo cáo "${template?.name}" — ${SCOPE_LABEL[scope]} — ${period} — ${format}`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FileText}
        title="Kết xuất Báo cáo Bộ GD&ĐT"
        subtitle="Tự động tổng hợp các biểu mẫu báo cáo STEM và sử dụng thiết bị theo Thông tư, quy chuẩn báo cáo định kỳ của Bộ GD&ĐT."
        accentColor="#7c3aed"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={FileText} label="Template Thông tư" value={MINISTRY_REPORT_TEMPLATES.length} color="#7c3aed" />
        <KpiCard icon={Download} label="Báo cáo đã xuất (QTD)" value={authorityReports.length} color="#2563eb" />
        <KpiCard icon={CheckCircle2} label="Đã nộp lên Bộ" value={3} color="#16a34a" />
        <KpiCard icon={Calendar} label="Kỳ báo cáo tới" value="30/06/2026" color="#c8a84e" subtitle="Q2/2026" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Generator form */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="mb-4" style={{ fontSize: "14px", fontWeight: 700 }}>
            <FileType className="w-4 h-4 inline mr-1.5 text-[#7c3aed]" />
            Tạo báo cáo mới
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>TEMPLATE THÔNG TƯ *</label>
              <div className="mt-1 space-y-1.5">
                {MINISTRY_REPORT_TEMPLATES.map((t) => (
                  <label key={t.code}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate === t.code ? "border-[#7c3aed] bg-[#7c3aed]/5" : "border-border hover:bg-secondary"
                    }`}>
                    <input type="radio" name="template" checked={selectedTemplate === t.code}
                      onChange={() => setSelectedTemplate(t.code)} className="accent-[#7c3aed]" />
                    <div className="flex-1">
                      <p style={{ fontSize: "12.5px", fontWeight: 600 }}>{t.name}</p>
                      <p className="font-mono text-muted-foreground" style={{ fontSize: "11px" }}>{t.code}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>PHẠM VI</label>
                <select value={scope} onChange={(e) => setScope(e.target.value as typeof SCOPES[number])}
                  className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
                  style={{ fontSize: "13px" }}>
                  {SCOPES.map((s) => <option key={s} value={s}>{SCOPE_LABEL[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>KỲ BÁO CÁO</label>
                <select value={period} onChange={(e) => setPeriod(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
                  style={{ fontSize: "13px" }}>
                  {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>ĐỊNH DẠNG XUẤT</label>
              <div className="mt-1 flex gap-2">
                {FORMATS.map((f) => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      format === f ? "bg-[#7c3aed] text-white border-[#7c3aed]" : "bg-card border-border hover:bg-secondary"
                    }`}
                    style={{ fontSize: "12.5px", fontWeight: 500 }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate}
              className="w-full mt-3 px-4 py-3 bg-[#7c3aed] text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2 shadow-sm"
              style={{ fontSize: "14px", fontWeight: 600 }}>
              <Download className="w-4 h-4" /> Tạo & Tải báo cáo
            </button>
          </div>
        </div>

        {/* Recent exports */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 700 }}>
              <History className="w-4 h-4 text-[#7c3aed]" />
              Báo cáo đã xuất
            </h3>
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
              {authorityReports.length} bản
            </span>
          </div>
          <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
            {authorityReports.map((r) => (
              <div key={r.id} className="p-3 hover:bg-secondary/50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#7c3aed]/15 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#7c3aed]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ fontSize: "12.5px", fontWeight: 600 }}>{r.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-secondary rounded font-mono" style={{ fontSize: "10px" }}>{r.templateCode}</span>
                      <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                        {SCOPE_LABEL[r.scope]} · {r.period}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10.5px" }}>
                      Xuất {formatRelative(r.generatedAt)}
                    </p>
                  </div>
                  <button onClick={() => toast.info(`Tải ${r.name}`)}
                    className="p-1.5 hover:bg-secondary rounded" title="Tải">
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#7c3aed]/5 to-[#c8a84e]/5 rounded-xl border border-border p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-[#7c3aed] shrink-0 mt-0.5" />
        <div>
          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
            Template báo cáo chuẩn Bộ GD&ĐT
          </p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "12px", lineHeight: 1.6 }}>
            Hệ thống tự động tổng hợp dữ liệu từ Data Lake và điền vào các biểu mẫu theo chuẩn Thông tư
            (38/2023, 32/2020, 26/2020) và Công văn 1014. Dữ liệu được đảm bảo "Đúng – Đủ – Sạch – Sống"
            trước khi xuất báo cáo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MinistryReportExporter;
