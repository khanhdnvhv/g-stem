import { useState } from "react";
import {
  Network, Database, IdCard, RefreshCw, CheckCircle2, AlertTriangle,
  Clock, Download, Play, ArrowDown, ArrowUp,
} from "lucide-react";
import { dataSyncRecords } from "../../mock-data/index";
import type { DataSyncRecord } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { DataQualityBadge } from "../ui/badges";
import { formatDateTime, formatRelative } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  NATIONAL DATA SYNC — Đồng bộ CSDL Quốc gia + VNeID              */
/* ================================================================ */

const SOURCE_META: Record<DataSyncRecord["source"], { label: string; color: string; icon: typeof Database }> = {
  NEdu:  { label: "CSDL Ngành GD",   color: "#7c3aed", icon: Database },
  VNeID: { label: "VNeID",            color: "#16a34a", icon: IdCard },
  ERP:   { label: "ERP Nội bộ NCC",   color: "#c8a84e", icon: Network },
  CRM:   { label: "CRM Đại lý",       color: "#0891b2", icon: Network },
};

const STATUS_META: Record<DataSyncRecord["status"], { label: string; color: string }> = {
  queued:  { label: "Trong hàng đợi", color: "#64748b" },
  running: { label: "Đang chạy",       color: "#7c3aed" },
  done:    { label: "Hoàn tất",        color: "#16a34a" },
  error:   { label: "Lỗi",             color: "#dc2626" },
};

export function NationalDataSync() {
  const [sourceFilter, setSourceFilter] = useState<DataSyncRecord["source"] | "all">("all");

  const filtered = dataSyncRecords.filter((r) =>
    sourceFilter === "all" || r.source === sourceFilter
  );

  const totalRecords = dataSyncRecords.reduce((s, r) => s + r.count, 0);
  const errorCount = dataSyncRecords.filter((r) => r.status === "error").length;
  const doneCount = dataSyncRecords.filter((r) => r.status === "done").length;
  const runningCount = dataSyncRecords.filter((r) => r.status === "running").length;

  // 4Đ overall score
  const allQuality = dataSyncRecords.flatMap((r) => [r.quality4D.dung, r.quality4D.du, r.quality4D.sach, r.quality4D.song]);
  const qualityScore = Math.round((allQuality.filter(Boolean).length / allQuality.length) * 100);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Network}
        title="Đồng bộ CSDL Quốc gia & VNeID"
        subtitle="Cổng giao tiếp tích hợp, đồng bộ và đối soát dữ liệu tự động với Hệ thống CSDL ngành giáo dục, VNeID và các nền tảng khác."
        accentColor="#7c3aed"
        actions={
          <>
            <button onClick={() => toast.success("Đã kích hoạt sync toàn bộ 4 nguồn")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Play className="w-4 h-4" /> Sync toàn bộ
            </button>
            <button onClick={() => toast.info("Xem log lỗi chi tiết")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Tải log
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Database} label="Tổng bản ghi đồng bộ" value={totalRecords.toLocaleString()} color="#7c3aed" change="+12k" trend="up" />
        <KpiCard icon={CheckCircle2} label="Đạt chất lượng 4Đ" value={`${qualityScore}%`} color="#16a34a" subtitle="Đúng · Đủ · Sạch · Sống" />
        <KpiCard icon={RefreshCw} label="Đang chạy" value={runningCount} color="#0891b2" />
        <KpiCard icon={AlertTriangle} label="Lỗi cần xử lý" value={errorCount} color="#dc2626" trend={errorCount > 0 ? "up" : "flat"} />
      </div>

      {/* 4 nguồn tích hợp */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(SOURCE_META) as Array<keyof typeof SOURCE_META>).map((src) => {
          const meta = SOURCE_META[src];
          const Icon = meta.icon;
          const records = dataSyncRecords.filter((r) => r.source === src);
          const lastSync = records[0];
          return (
            <div key={src} className="bg-card rounded-xl border border-border p-4 hover:shadow-md">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: meta.color + "15" }}>
                  <Icon className="w-5 h-5" style={{ color: meta.color }} />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontSize: "13px", fontWeight: 700 }}>{meta.label}</h3>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                    {records.length} phiên đồng bộ
                  </p>
                </div>
              </div>
              {lastSync && (
                <div className="space-y-1.5">
                  <DataQualityBadge quality4D={lastSync.quality4D} size="xs" />
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                    Lần cuối: {formatRelative(lastSync.startedAt)}
                  </p>
                </div>
              )}
              <button onClick={() => toast.success(`Đồng bộ ${meta.label} ngay`)}
                className="mt-3 w-full px-3 py-1.5 rounded-lg text-white flex items-center justify-center gap-1"
                style={{ fontSize: "11.5px", fontWeight: 500, backgroundColor: meta.color }}>
                <RefreshCw className="w-3 h-3" /> Đồng bộ ngay
              </button>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setSourceFilter("all")}
          className={`px-3 py-2 rounded-lg border ${sourceFilter === "all" ? "bg-[#7c3aed] text-white border-[#7c3aed]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả ({dataSyncRecords.length})
        </button>
        {(Object.keys(SOURCE_META) as Array<keyof typeof SOURCE_META>).map((src) => {
          const meta = SOURCE_META[src];
          const count = dataSyncRecords.filter((r) => r.source === src).length;
          return (
            <button key={src} onClick={() => setSourceFilter(src)}
              className={`px-3 py-2 rounded-lg border ${sourceFilter === src ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(sourceFilter === src ? { backgroundColor: meta.color } : {}),
              }}>
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Records table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">Mã phiên</th>
                <th className="px-4 py-2.5">Nguồn</th>
                <th className="px-4 py-2.5">Chiều</th>
                <th className="px-4 py-2.5">Entity</th>
                <th className="px-4 py-2.5 text-right">Bản ghi</th>
                <th className="px-4 py-2.5">Trạng thái</th>
                <th className="px-4 py-2.5">Chất lượng 4Đ</th>
                <th className="px-4 py-2.5">Bắt đầu</th>
                <th className="px-4 py-2.5">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
              {filtered.map((r) => {
                const srcMeta = SOURCE_META[r.source];
                const stMeta = STATUS_META[r.status];
                return (
                  <tr key={r.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3 font-mono" style={{ fontSize: "11px", fontWeight: 600 }}>{r.id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style={{
                        fontSize: "10.5px", fontWeight: 600,
                        color: srcMeta.color, backgroundColor: srcMeta.color + "15",
                      }}>
                        {srcMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.direction === "in" ? (
                        <span className="inline-flex items-center gap-0.5 text-[#16a34a]" style={{ fontSize: "11px", fontWeight: 600 }}>
                          <ArrowDown className="w-3 h-3" /> Kéo về
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[#0891b2]" style={{ fontSize: "11px", fontWeight: 600 }}>
                          <ArrowUp className="w-3 h-3" /> Đẩy lên
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono" style={{ fontSize: "11px" }}>{r.entity}</td>
                    <td className="px-4 py-3 text-right" style={{ fontWeight: 600 }}>{r.count.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded" style={{
                        fontSize: "10.5px", fontWeight: 600,
                        color: stMeta.color, backgroundColor: stMeta.color + "15",
                      }}>
                        {r.status === "running" && <RefreshCw className="w-3 h-3 animate-spin" />}
                        {r.status === "done" && <CheckCircle2 className="w-3 h-3" />}
                        {r.status === "error" && <AlertTriangle className="w-3 h-3" />}
                        {r.status === "queued" && <Clock className="w-3 h-3" />}
                        {stMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3"><DataQualityBadge quality4D={r.quality4D} size="xs" /></td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11px" }}>{formatDateTime(r.startedAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>{r.note || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#7c3aed]/5 to-[#16a34a]/5 rounded-xl border border-border p-4 flex items-start gap-3">
        <Database className="w-5 h-5 text-[#7c3aed] shrink-0 mt-0.5" />
        <div>
          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
            Nguyên tắc chất lượng dữ liệu "Đúng – Đủ – Sạch – Sống"
          </p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "12px", lineHeight: 1.6 }}>
            <strong>Đúng:</strong> đúng chuẩn định danh, đúng quy ước. {" "}
            <strong>Đủ:</strong> đủ trường dữ liệu bắt buộc. {" "}
            <strong>Sạch:</strong> loại trùng lặp, sai định dạng. {" "}
            <strong>Sống:</strong> được cập nhật thường xuyên theo chu kỳ quy định.
          </p>
        </div>
      </div>
    </div>
  );
}

export default NationalDataSync;
