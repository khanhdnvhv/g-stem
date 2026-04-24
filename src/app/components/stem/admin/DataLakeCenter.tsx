import { useState } from "react";
import {
  Database, Activity, RefreshCw, CheckCircle2, AlertTriangle,
  Download, Upload, Search, PackageCheck, Droplets,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { dataSyncRecords, catalogs } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { DataQualityBadge } from "../ui/badges";
import { toast } from "sonner";

/* ================================================================ */
/*  DATA LAKE CENTER — Đúng · Đủ · Sạch · Sống                      */
/* ================================================================ */

const DATASETS = [
  { name: "Students Master", records: 2_150_340, sizeGB: 4.2, updated: "5 phút trước", source: "NEdu + VNeID", quality: 94 },
  { name: "Teachers Master", records: 79_230, sizeGB: 0.8, updated: "12 phút trước", source: "NEdu", quality: 96 },
  { name: "Schools Directory", records: 2_850, sizeGB: 0.1, updated: "1 giờ trước", source: "Sở/Bộ GD&ĐT", quality: 98 },
  { name: "Equipment Inventory", records: 147_890, sizeGB: 2.1, updated: "30 phút trước", source: "Internal", quality: 91 },
  { name: "Orders & Contracts", records: 32_450, sizeGB: 1.8, updated: "3 phút trước", source: "Internal", quality: 99 },
  { name: "Exam Results", records: 890_120, sizeGB: 3.4, updated: "2 giờ trước", source: "Internal", quality: 93 },
  { name: "STEM Lessons", records: 12_450, sizeGB: 18.6, updated: "45 phút trước", source: "Content Bank", quality: 95 },
  { name: "License Usage Log", records: 1_250_890, sizeGB: 0.9, updated: "Liên tục", source: "Internal", quality: 99 },
];

export function DataLakeCenter() {
  const [tab, setTab] = useState<"overview" | "nedu" | "vneid" | "etl" | "quality">("overview");

  const totalRecords = DATASETS.reduce((s, d) => s + d.records, 0);
  const totalStorage = DATASETS.reduce((s, d) => s + d.sizeGB, 0);
  const avgQuality = Math.round(DATASETS.reduce((s, d) => s + d.quality, 0) / DATASETS.length);

  // 4D breakdown across all records
  const allQ4D = dataSyncRecords.flatMap((r) => Object.entries(r.quality4D));
  const dqStats = {
    dung:  allQ4D.filter(([k, v]) => k === "dung" && v).length / dataSyncRecords.length * 100,
    du:    allQ4D.filter(([k, v]) => k === "du" && v).length / dataSyncRecords.length * 100,
    sach:  allQ4D.filter(([k, v]) => k === "sach" && v).length / dataSyncRecords.length * 100,
    song:  allQ4D.filter(([k, v]) => k === "song" && v).length / dataSyncRecords.length * 100,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Database}
        title='Data Lake Center — "Đúng · Đủ · Sạch · Sống"'
        subtitle="Hạ tầng dữ liệu trung tâm của STEM Platform. Đồng bộ CSDL quốc gia, VNeID, ERP, CRM với chuẩn chất lượng 4Đ."
        accentColor="#e74c3c"
        actions={
          <button onClick={() => toast.success("Kích hoạt pipeline ETL toàn bộ 4 nguồn")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#e74c3c] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <RefreshCw className="w-4 h-4" /> Trigger ETL
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Database} label="Tổng bản ghi" value={(totalRecords / 1_000_000).toFixed(1) + "M"} color="#e74c3c" change="+2%" trend="up" />
        <KpiCard icon={Upload} label="Dung lượng" value={`${totalStorage.toFixed(1)} GB`} color="#7c3aed" />
        <KpiCard icon={CheckCircle2} label="Chất lượng 4Đ TB" value={`${avgQuality}%`} color="#16a34a" />
        <KpiCard icon={Activity} label="ETL pipelines" value={8} color="#0891b2" subtitle="4 active, 4 scheduled" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto">
        {[
          { id: "overview", label: "Tổng quan",   icon: Database },
          { id: "nedu",     label: "CSDL Ngành",  icon: Upload },
          { id: "vneid",    label: "VNeID",       icon: CheckCircle2 },
          { id: "etl",      label: "ETL Pipeline", icon: Activity },
          { id: "quality",  label: "4Đ Quality",  icon: Droplets },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              tab === t.id ? "bg-[#e74c3c] text-white" : "hover:bg-secondary"
            }`}
            style={{ fontSize: "12.5px", fontWeight: tab === t.id ? 600 : 500 }}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Datasets chính trong Data Lake</h3>
          </div>
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">Dataset</th>
                <th className="px-4 py-2.5">Nguồn</th>
                <th className="px-4 py-2.5 text-right">Bản ghi</th>
                <th className="px-4 py-2.5 text-right">Dung lượng</th>
                <th className="px-4 py-2.5">Cập nhật</th>
                <th className="px-4 py-2.5">Chất lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
              {DATASETS.map((d) => (
                <tr key={d.name} className="hover:bg-secondary/50">
                  <td className="px-4 py-3" style={{ fontWeight: 500 }}>{d.name}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>{d.source}</td>
                  <td className="px-4 py-3 text-right">{d.records.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{d.sizeGB.toFixed(1)} GB</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>{d.updated}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-[#16a34a]" style={{ width: `${d.quality}%` }} />
                      </div>
                      <span style={{ fontSize: "11.5px", fontWeight: 600 }}>{d.quality}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(tab === "nedu" || tab === "vneid") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
              <RefreshCw className="w-4 h-4 inline mr-1.5" />
              {tab === "nedu" ? "CSDL Ngành Giáo dục" : "VNeID Định danh"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                <span style={{ fontSize: "12.5px" }}>Endpoint</span>
                <code style={{ fontSize: "11.5px", fontWeight: 600 }}>
                  {tab === "nedu" ? "https://csdl.moet.gov.vn/api/v3" : "https://api.vneid.gov.vn/v2"}
                </code>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                <span style={{ fontSize: "12.5px" }}>Trạng thái kết nối</span>
                <span className="inline-flex items-center gap-1 text-[#16a34a]" style={{ fontSize: "12px", fontWeight: 600 }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                <span style={{ fontSize: "12.5px" }}>Lần sync cuối</span>
                <span style={{ fontSize: "12.5px", fontWeight: 600 }}>5 phút trước</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                <span style={{ fontSize: "12.5px" }}>Chu kỳ sync</span>
                <span style={{ fontSize: "12.5px", fontWeight: 600 }}>Mỗi 15 phút</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Thống kê sync 24 giờ qua</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={[
                { h: "00h", ok: 120, err: 2 }, { h: "04h", ok: 95, err: 1 },
                { h: "08h", ok: 320, err: 3 }, { h: "12h", ok: 280, err: 2 },
                { h: "16h", ok: 410, err: 0 }, { h: "20h", ok: 180, err: 1 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="h" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="ok" stroke="#16a34a" strokeWidth={2} name="Thành công" />
                <Line type="monotone" dataKey="err" stroke="#dc2626" strokeWidth={2} name="Lỗi" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "etl" && (
        <div className="space-y-3">
          {[
            { name: "Student Master ETL",  source: "NEdu → Data Lake", status: "running", progress: 68 },
            { name: "Equipment Sync",       source: "Schools → Data Lake", status: "done", progress: 100 },
            { name: "Exam Scores Ingest",   source: "Internal → Data Warehouse", status: "done", progress: 100 },
            { name: "VNeID Identity Match", source: "VNeID → Data Lake", status: "scheduled", progress: 0 },
          ].map((p) => (
            <div key={p.name} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600 }}>{p.name}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>{p.source}</p>
                </div>
                <span className={`px-2 py-0.5 rounded inline-flex items-center gap-1`}
                  style={{
                    fontSize: "10.5px", fontWeight: 600,
                    color: p.status === "done" ? "#16a34a" : p.status === "running" ? "#7c3aed" : "#64748b",
                    backgroundColor: (p.status === "done" ? "#16a34a" : p.status === "running" ? "#7c3aed" : "#64748b") + "15",
                  }}>
                  {p.status === "running" && <RefreshCw className="w-3 h-3 animate-spin" />}
                  {p.status === "done" ? "Hoàn tất" : p.status === "running" ? "Đang chạy" : "Lên lịch"}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full transition-all" style={{
                  width: `${p.progress}%`,
                  backgroundColor: p.status === "done" ? "#16a34a" : p.status === "running" ? "#7c3aed" : "#64748b",
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "quality" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Droplets className="w-4 h-4 inline mr-1.5 text-[#7c3aed]" />
              Chất lượng dữ liệu theo tiêu chí 4Đ
            </h3>
            <div className="space-y-3">
              {[
                { key: "dung",  label: "Đúng — đúng chuẩn, đúng quy ước",   value: Math.round(dqStats.dung),  color: "#16a34a" },
                { key: "du",    label: "Đủ — đủ trường bắt buộc",             value: Math.round(dqStats.du),    color: "#0891b2" },
                { key: "sach",  label: "Sạch — loại trùng, loại sai định dạng", value: Math.round(dqStats.sach), color: "#7c3aed" },
                { key: "song",  label: "Sống — cập nhật thường xuyên",         value: Math.round(dqStats.song),  color: "#f59e0b" },
              ].map((d) => (
                <div key={d.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: "12px", fontWeight: 500 }}>{d.label}</span>
                    <strong style={{ color: d.color }}>{d.value}%</strong>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full transition-all" style={{
                      width: `${d.value}%`, backgroundColor: d.color,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Danh mục chuẩn hóa</h3>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
              Data Lake sử dụng {catalogs.length} mục dùng chung để chuẩn hóa dữ liệu liên thông giữa các tenant và nguồn ngoài.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["subject", "grade", "skill"].map((c) => {
                const count = catalogs.filter((x) => x.catalog === c).length;
                return (
                  <div key={c} className="bg-secondary/40 rounded-lg p-3 text-center">
                    <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{c}</p>
                    <p style={{ fontSize: "18px", fontWeight: 700 }}>{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataLakeCenter;
