import { useState } from "react";
import {
  FileText, Settings2, Download, Eye, Calendar, Layers, Users,
  BarChart3, CheckCircle2, Plus, X, ChevronDown, Table2,
} from "lucide-react";
import { tenantsByType } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { toast } from "@/app/lib/toast";
import { cn } from "../ui/utils";
import type { ElementType } from "react";

/* ================================================================ */
/*  REPORT BUILDER — Tạo báo cáo tùy chỉnh cho Hiệu trưởng          */
/* ================================================================ */

interface ReportType {
  id: string;
  label: string;
  icon: ElementType;
  description: string;
}

const REPORT_TYPES: ReportType[] = [
  { id: "usage", label: "Báo cáo sử dụng phòng STEM", icon: Layers, description: "Thống kê số tiết, tỉ lệ sử dụng, theo phòng và theo lớp" },
  { id: "effectiveness", label: "Báo cáo hiệu quả giảng dạy", icon: BarChart3, description: "Điểm STEM, tiến độ hoàn thành khóa học, so sánh lớp" },
  { id: "license", label: "Báo cáo license & tài khoản", icon: CheckCircle2, description: "Tình trạng phân bổ, sử dụng, sắp hết hạn" },
  { id: "equipment", label: "Báo cáo thiết bị & bảo hành", icon: Settings2, description: "Tình trạng thiết bị, lịch sử bảo hành, tuổi thọ" },
  { id: "teacher", label: "Báo cáo giảng dạy GV STEM", icon: Users, description: "Phân công, tiến độ tập huấn, giờ dạy thực tế" },
];

const METRICS_BY_TYPE: Record<string, Array<{ id: string; label: string }>> = {
  usage: [
    { id: "sessions", label: "Số tiết / buổi" },
    { id: "utilization", label: "Tỉ lệ sử dụng %" },
    { id: "peak_hours", label: "Giờ cao điểm" },
    { id: "class_count", label: "Số lớp tham gia" },
    { id: "teacher_count", label: "Số GV sử dụng" },
  ],
  effectiveness: [
    { id: "avg_score", label: "Điểm STEM trung bình" },
    { id: "completion_rate", label: "Tỉ lệ hoàn thành %" },
    { id: "attendance", label: "Điểm danh %" },
    { id: "improvement", label: "Cải thiện so kỳ trước" },
  ],
  license: [
    { id: "total_assigned", label: "Tổng license đã phân bổ" },
    { id: "unassigned", label: "License chưa sử dụng" },
    { id: "expired", label: "Đã hết hạn" },
    { id: "expiring_soon", label: "Sắp hết hạn (30 ngày)" },
  ],
  equipment: [
    { id: "ok_count", label: "Thiết bị hoạt động tốt" },
    { id: "broken_count", label: "Thiết bị hỏng / thiếu" },
    { id: "maintenance_requests", label: "Yêu cầu bảo trì" },
    { id: "repair_time", label: "Thời gian xử lý TB" },
  ],
  teacher: [
    { id: "lessons_taught", label: "Số tiết đã dạy" },
    { id: "training_progress", label: "Tiến độ tập huấn %" },
    { id: "certifications", label: "Chứng chỉ đạt được" },
    { id: "classes_count", label: "Số lớp phụ trách" },
  ],
};

const GROUPBY_OPTIONS = [
  { id: "room", label: "Theo phòng" },
  { id: "class", label: "Theo lớp" },
  { id: "grade", label: "Theo khối" },
  { id: "teacher", label: "Theo giáo viên" },
  { id: "program", label: "Theo chương trình" },
];

const PREVIEW_DATA: Record<string, { headers: string[]; rows: string[][] }> = {
  usage: {
    headers: ["Phòng", "Số tiết", "Tỉ lệ SD%", "Ngày cao điểm", "Số lớp"],
    rows: [
      ["P-STEM-01", "62", "78%", "Thứ 3", "12"],
      ["P-STEM-02", "55", "69%", "Thứ 4", "10"],
      ["P-ROBOT",   "48", "60%", "Thứ 5", "8"],
      ["P-IOT",     "21", "26%", "Thứ 6", "4"],
      ["Tổng",      "186", "58%", "—", "34"],
    ],
  },
  effectiveness: {
    headers: ["Lớp", "Điểm TB", "Hoàn thành%", "Điểm danh%"],
    rows: [
      ["Lớp 6A", "8.4", "91%", "96%"],
      ["Lớp 6B", "8.1", "88%", "94%"],
      ["Lớp 7A", "8.7", "94%", "97%"],
      ["Lớp 7B", "8.0", "86%", "93%"],
      ["Lớp 8A", "8.5", "92%", "95%"],
    ],
  },
  license: {
    headers: ["Loại license", "Phân bổ", "Đang dùng", "Sắp hết hạn"],
    rows: [
      ["Học sinh",   "1200", "1184", "22"],
      ["Giáo viên",  "68",   "65",   "3"],
      ["Admin",      "5",    "5",    "0"],
      ["Khách",      "50",   "18",   "12"],
      ["Tổng",       "1323", "1272", "37"],
    ],
  },
  equipment: {
    headers: ["Phòng", "Tốt", "Hỏng", "Đang bảo hành"],
    rows: [
      ["P-STEM-01", "22",  "2",  "1"],
      ["P-STEM-02", "18",  "0",  "0"],
      ["P-ROBOT",   "14",  "2",  "2"],
      ["P-IOT",     "15",  "5",  "3"],
      ["Tổng",      "69",  "9",  "6"],
    ],
  },
  teacher: {
    headers: ["Giáo viên", "Số tiết", "Tập huấn%", "Chứng chỉ"],
    rows: [
      ["Phạm Anh Tuấn",   "48", "100%", "3"],
      ["Nguyễn Thị Lan",  "42", "92%",  "2"],
      ["Trần Văn Hùng",   "39", "88%",  "2"],
      ["Lê Minh Trang",   "35", "80%",  "1"],
      ["Vũ Thanh Hương",  "22", "75%",  "1"],
    ],
  },
};

type Step = 1 | 2 | 3;

export function ReportBuilder() {
  const { user } = useAuth();

  const [reportType, setReportType] = useState("usage");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-05-31");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["sessions", "utilization"]);
  const [groupBy, setGroupBy] = useState("room");
  const [step, setStep] = useState<Step>(1);

  const currentType = REPORT_TYPES.find((t) => t.id === reportType)!;
  const metrics = METRICS_BY_TYPE[reportType] ?? [];
  const preview = PREVIEW_DATA[reportType] ?? PREVIEW_DATA.usage;

  function toggleMetric(id: string) {
    setSelectedMetrics((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function applyPreset(preset: "month" | "semester" | "year") {
    if (preset === "month") { setDateFrom("2026-05-01"); setDateTo("2026-05-31"); }
    else if (preset === "semester") { setDateFrom("2026-01-01"); setDateTo("2026-05-31"); }
    else { setDateFrom("2025-09-01"); setDateTo("2026-05-31"); }
  }

  const steps = [
    { n: 1, label: "Cấu hình" },
    { n: 2, label: "Xem trước" },
    { n: 3, label: "Xuất file" },
  ];

  const fileName = `BaoCao_${reportType}_${dateFrom}_${dateTo}.xlsx`;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FileText}
        title="Trình tạo báo cáo"
        subtitle="Tự tạo báo cáo tùy chỉnh theo nhu cầu của trường."
        accentColor="#990803"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                  step > s.n
                    ? "bg-primary border-primary text-primary-foreground"
                    : step === s.n
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground bg-background"
                )}
              >
                {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  step === s.n ? "text-primary" : step > s.n ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-px mx-3", step > s.n ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Cấu hình ── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Loại báo cáo */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Loại báo cáo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {REPORT_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setReportType(t.id);
                      setSelectedMetrics(METRICS_BY_TYPE[t.id]?.slice(0, 2).map((m) => m.id) ?? []);
                    }}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                      reportType === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        reportType === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={cn("text-xs font-semibold", reportType === t.id ? "text-primary" : "text-foreground")}>
                        {t.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Khoảng thời gian */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Khoảng thời gian
            </h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs text-muted-foreground block mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs text-muted-foreground block mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 pb-0.5">
                <button onClick={() => applyPreset("month")} className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                  Tháng này
                </button>
                <button onClick={() => applyPreset("semester")} className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                  Học kỳ 2
                </button>
                <button onClick={() => applyPreset("year")} className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                  Cả năm
                </button>
              </div>
            </div>
          </div>

          {/* Chỉ số theo dõi */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Chỉ số theo dõi</h3>
            <div className="flex flex-wrap gap-2">
              {metrics.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMetric(m.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
                    selectedMetrics.includes(m.id)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/40 text-muted-foreground"
                  )}
                >
                  {selectedMetrics.includes(m.id) ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  {m.label}
                </button>
              ))}
            </div>
            {selectedMetrics.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">Vui lòng chọn ít nhất một chỉ số.</p>
            )}
          </div>

          {/* Phân nhóm theo */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Phân nhóm theo</h3>
            <div className="flex flex-wrap gap-2">
              {GROUPBY_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGroupBy(g.id)}
                  className={cn(
                    "text-xs px-4 py-2 rounded-lg border transition-colors",
                    groupBy === g.id
                      ? "border-primary bg-primary text-primary-foreground font-medium"
                      : "border-border hover:bg-muted text-muted-foreground"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={selectedMetrics.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              Xem trước báo cáo →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Preview ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Xem trước: {currentType.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Khoảng thời gian: {dateFrom} → {dateTo} · Nhóm theo: {GROUPBY_OPTIONS.find((g) => g.id === groupBy)?.label}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {selectedMetrics.map((m) => {
                  const label = metrics.find((x) => x.id === m)?.label ?? m;
                  return (
                    <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {preview.headers.map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground pb-2 pr-4 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.rows.map((row, i) => (
                    <tr key={i} className={cn("hover:bg-muted/50 transition-colors", i === preview.rows.length - 1 && "font-semibold bg-muted/30")}>
                      {row.map((cell, j) => (
                        <td key={j} className="py-2.5 pr-4 text-xs text-foreground whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground mt-3 italic">
              * Dữ liệu xem trước — báo cáo đầy đủ sẽ được xuất file.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              ← Quay lại cấu hình
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuất báo cáo →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Exported ── */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground">Báo cáo đã sẵn sàng!</h3>
            <p className="text-sm text-muted-foreground mt-1">{currentType.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{dateFrom} → {dateTo}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground">Sẵn sàng tải xuống</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => toast.success("Đang tải xuống " + fileName)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Tải xuống Excel
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                <FileText className="w-4 h-4" />
                Tải xuống PDF
              </button>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Plus className="w-4 h-4" />
            Tạo báo cáo mới
          </button>
        </div>
      )}
    </div>
  );
}
