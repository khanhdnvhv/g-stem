import { useState } from "react";
import {
  CameraOff, Camera, Mic, MicOff, Monitor, Clock, AlertTriangle,
  AlertCircle, CheckCircle2, ShieldCheck, Brain, Sparkles, ScanFace,
  Activity, Cpu, Send, MessageSquare, Megaphone, FileWarning,
  Printer, Download, X, Info, Ban, Maximize2, Eye,
} from "lucide-react";
import type { ProctoringSession, SuspiciousEvent } from "./types";
import {
  ALERT_CONFIGS, SEVERITY_CONFIG, STATUS_CONFIG, AI_THREAT_CONFIG,
  CONNECTION_CONFIG, formatTime,
} from "./types";

// ── Risk Score Ring ──
export function RiskRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = Math.PI * 2 * r;
  const offset = c - (score / 100) * c;
  const color = score > 60 ? "#dc2626" : score > 30 ? "#f59e0b" : "#22c55e";
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.5s ease" }} />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.28} fontWeight="800"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{score}</text>
    </svg>
  );
}

// ── SVG Donut Chart ──
export function RiskDonutChart({ sessions }: { sessions: ProctoringSession[] }) {
  const high = sessions.filter(s => s.riskScore > 60).length;
  const medium = sessions.filter(s => s.riskScore > 30 && s.riskScore <= 60).length;
  const low = sessions.filter(s => s.riskScore <= 30).length;
  const total = sessions.length || 1;
  const segments = [
    { value: high, color: "#ef4444", label: "Cao" },
    { value: medium, color: "#f59e0b", label: "TB" },
    { value: low, color: "#22c55e", label: "Thấp" },
  ];
  let cumulative = 0;
  const r = 40;
  const c = Math.PI * 2 * r;
  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashArray = `${pct * c} ${c}`;
          const dashOffset = -cumulative * c;
          cumulative += pct;
          return (
            <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="12"
              strokeDasharray={dashArray} strokeDashoffset={dashOffset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "all 0.5s" }} />
          );
        })}
        <text x="50" y="48" textAnchor="middle" fill="#1a1d2e" fontSize="16" fontWeight="800">{total}</text>
        <text x="50" y="62" textAnchor="middle" fill="#6b7280" fontSize="8">phiên</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-gray-600" style={{ fontSize: "11px" }}>{seg.label}: <span style={{ fontWeight: 700 }}>{seg.value}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Activity Heatmap ──
export function ActivityHeatmap({ sessions }: { sessions: ProctoringSession[] }) {
  const types = ["tab_switch", "face_absent", "multiple_faces", "copy_paste", "audio_anomaly", "idle"] as const;
  const labels = ["Tab switch", "Mặt vắng", "Nhiều mặt", "Copy/Paste", "Âm thanh", "Idle"];
  const cols = 12;
  const now = Date.now();
  const data = types.map(type =>
    Array.from({ length: cols }, (_, col) => {
      const slotStart = now - (cols - col) * 5 * 60 * 1000;
      const slotEnd = slotStart + 5 * 60 * 1000;
      return sessions.reduce((count, s) =>
        count + s.suspiciousEvents.filter(e =>
          e.type === type && new Date(e.timestamp).getTime() >= slotStart && new Date(e.timestamp).getTime() < slotEnd
        ).length, 0);
    })
  );
  const maxVal = Math.max(1, ...data.flat());
  const cellW = 28; const cellH = 22; const labelW = 70; const gap = 2;
  return (
    <div className="overflow-x-auto">
      <svg width={labelW + cols * (cellW + gap) + 10} height={types.length * (cellH + gap) + 30}>
        {Array.from({ length: cols }, (_, i) => (
          <text key={i} x={labelW + i * (cellW + gap) + cellW / 2} y={12} textAnchor="middle" fill="#9ca3af" fontSize="8">{`-${(cols - i) * 5}'`}</text>
        ))}
        {data.map((row, ri) => (
          <g key={ri}>
            <text x={0} y={22 + ri * (cellH + gap) + cellH / 2 + 3} fill="#6b7280" fontSize="9" fontWeight="500">{labels[ri]}</text>
            {row.map((val, ci) => {
              const intensity = val / maxVal;
              const color = intensity === 0 ? "#f3f4f6" : intensity < 0.3 ? "#fef3c7" : intensity < 0.6 ? "#fbbf24" : intensity < 0.8 ? "#f97316" : "#ef4444";
              return (
                <rect key={ci} x={labelW + ci * (cellW + gap)} y={18 + ri * (cellH + gap)} width={cellW} height={cellH} rx="4" fill={color} style={{ transition: "fill 0.3s" }}>
                  <title>{`${labels[ri]}: ${val} sự kiện`}</title>
                </rect>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Activity Sparkline ──
export function Sparkline({ data, color, width = 80, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height}`).join(" ");
  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ── Webcam Feed ──
export function WebcamFeed({ name, avatar, active, risk, compact = false }: { name: string; avatar: string; active: boolean; risk: number; compact?: boolean }) {
  const borderColor = risk > 60 ? "#dc2626" : risk > 30 ? "#f59e0b" : "#22c55e";
  return (
    <div className="relative rounded-xl overflow-hidden border-2 aspect-video" style={{ borderColor }}>
      {active ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <div className={`${compact ? "w-8 h-8" : "w-14 h-14"} rounded-full bg-gray-600 flex items-center justify-center`}>
            <span className="text-white" style={{ fontSize: compact ? "10px" : "18px", fontWeight: 700 }}>{avatar}</span>
          </div>
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/50 text-white px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC
          </div>
          <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white px-1.5 py-0.5 rounded-lg" style={{ fontSize: compact ? "8px" : "10px" }}>
            {compact ? name.split(" ").slice(-1)[0] : name}
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-1">
          <CameraOff className={`${compact ? "w-5 h-5" : "w-8 h-8"} text-gray-300`} />
          <span className="text-gray-400" style={{ fontSize: compact ? "8px" : "11px" }}>Camera tắt</span>
        </div>
      )}
    </div>
  );
}

// ── Face Match Badge ──
export function FaceMatchBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 90 ? "#22c55e" : confidence >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color, background: `${color}15` }}>
      <ScanFace className="w-3 h-3" /> {confidence}%
    </span>
  );
}

// ── Connection Badge ──
export function ConnectionBadge({ quality }: { quality: ProctoringSession["connectionQuality"] }) {
  const cfg = CONNECTION_CONFIG[quality];
  const ConnIcon = cfg.icon;
  return (
    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: cfg.color, background: `${cfg.color}15` }}>
      <ConnIcon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

// ── Broadcast Modal ──
export function BroadcastModal({ onClose, onSend, selectedCount }: { onClose: () => void; onSend: (msg: string, type: "info" | "warning" | "urgent") => void; selectedCount: number }) {
  const [msg, setMsg] = useState("");
  const [type, setType] = useState<"info" | "warning" | "urgent">("info");
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#990803]/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-[#990803]" />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Phát thông báo</h3>
              <p className="text-gray-500" style={{ fontSize: "11px" }}>Gửi tới {selectedCount > 0 ? `${selectedCount} học viên đã chọn` : "tất cả học viên"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="flex gap-2">
          {([
            { key: "info" as const, label: "Thông tin", color: "#3b82f6" },
            { key: "warning" as const, label: "Cảnh báo", color: "#f59e0b" },
            { key: "urgent" as const, label: "Khẩn cấp", color: "#ef4444" },
          ]).map(t => (
            <button key={t.key} onClick={() => setType(t.key)}
              className={`flex-1 py-2 rounded-lg border cursor-pointer transition-all ${type === t.key ? "border-2" : "border-gray-200"}`}
              style={{ borderColor: type === t.key ? t.color : undefined, background: type === t.key ? `${t.color}08` : undefined, fontSize: "12px", fontWeight: 500, color: type === t.key ? t.color : "#6b7280" }}>
              {t.label}
            </button>
          ))}
        </div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3}
          placeholder="Nhập nội dung thông báo..."
          className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:outline-none resize-none"
          style={{ fontSize: "13px" }} />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer" style={{ fontSize: "13px" }}>Huỷ</button>
          <button onClick={() => { onSend(msg, type); setMsg(""); }} disabled={!msg.trim()}
            className="px-4 py-2 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] transition-colors cursor-pointer disabled:opacity-50" style={{ fontSize: "13px" }}>
            <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Gửi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Incident Report Modal ──
export function IncidentReportModal({ session, onClose }: { session: ProctoringSession; onClose: () => void }) {
  const unresolvedEvents = session.suspiciousEvents.filter(e => !e.resolved);
  const criticalEvents = unresolvedEvents.filter(e => e.severity === "critical" || e.severity === "high");
  const aiCfg = AI_THREAT_CONFIG[session.aiThreatLevel];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Báo cáo Vi phạm</h3>
              <p className="text-gray-500" style={{ fontSize: "11px" }}>Tự động tạo bởi AI Proctoring System</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer" title="In"
              onClick={() => { import("sonner").then(m => m.toast.success("Đang in báo cáo giám sát...")); }}><Printer className="w-4 h-4 text-gray-400" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer" title="Tải"
              onClick={() => { import("sonner").then(m => m.toast.success("Đang tải báo cáo giám sát...")); }}><Download className="w-4 h-4 text-gray-400" /></button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"><X className="w-4 h-4 text-gray-400" /></button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>BÁO CÁO SỐ: RPT-{session.id}</span>
            <span className="text-gray-400" style={{ fontSize: "10px" }}>{new Date().toLocaleString("vi-VN")}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Học viên", value: session.studentName },
              { label: "Mã HV", value: session.studentId },
              { label: "Đề thi", value: session.examTitle },
              { label: "Phòng thi", value: session.room },
              { label: "Công ty", value: session.subsidiary },
              { label: "Phòng ban", value: session.department },
              { label: "Bắt đầu", value: new Date(session.startedAt).toLocaleString("vi-VN") },
              { label: "Thời gian làm", value: formatTime(session.timeSpent) },
            ].map(item => (
              <div key={item.label}>
                <span className="text-gray-400" style={{ fontSize: "10px" }}>{item.label}</span>
                <p className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: session.riskScore > 60 ? "#fef2f2" : session.riskScore > 30 ? "#fffbeb" : "#f0fdf4" }}>
          <RiskRing score={session.riskScore} size={60} />
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: session.riskScore > 60 ? "#dc2626" : session.riskScore > 30 ? "#d97706" : "#16a34a" }}>
              Mức độ rủi ro: {session.riskScore > 60 ? "CAO" : session.riskScore > 30 ? "TRUNG BÌNH" : "THẤP"}
            </p>
            <p className="text-gray-600" style={{ fontSize: "11px" }}>
              Face Match: {session.faceMatchConfidence}% | Tab switches: {session.tabSwitches} | AI Threat: {aiCfg.label}
            </p>
          </div>
        </div>

        <div>
          <h4 className="flex items-center gap-1.5 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Brain className="w-4 h-4 text-purple-500" /> Phân tích AI
          </h4>
          <div className="space-y-1.5">
            {session.aiInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <span className="text-gray-700" style={{ fontSize: "11px" }}>{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {criticalEvents.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>
              <AlertTriangle className="w-4 h-4 text-red-500" /> Sự kiện nghiêm trọng ({criticalEvents.length})
            </h4>
            <div className="space-y-2">
              {criticalEvents.map(evt => {
                const config = ALERT_CONFIGS[evt.type];
                return (
                  <div key={evt.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${config?.color}20` }}>
                      {config?.icon && <config.icon className="w-4 h-4" style={{ color: config.color }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{config?.label || evt.type}</p>
                      <p className="text-gray-500" style={{ fontSize: "10px" }}>{new Date(evt.timestamp).toLocaleString("vi-VN")}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 700, color: SEVERITY_CONFIG[evt.severity].color, background: SEVERITY_CONFIG[evt.severity].bg }}>
                      {SEVERITY_CONFIG[evt.severity].label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-amber-50 rounded-xl p-4">
          <h4 className="flex items-center gap-1.5 mb-2" style={{ fontSize: "13px", fontWeight: 600, color: "#92400e" }}>
            <Info className="w-4 h-4" /> Khuyến nghị xử lý
          </h4>
          <p className="text-amber-800" style={{ fontSize: "12px" }}>
            {session.riskScore > 60
              ? "Khuyến nghị huỷ kết quả bài thi và yêu cầu thi lại dưới giám sát chặt chẽ hơn. Chuyển hồ sơ cho Ban Đào tạo xem xét kỷ luật."
              : session.riskScore > 30
              ? "Cần xem xét lại các sự kiện cảnh báo. Nếu xác minh vi phạm, áp dụng cảnh cáo và ghi nhận vào hồ sơ đào tạo."
              : "Không phát hiện dấu hiệu bất thường nghiêm trọng. Kết quả thi hợp lệ."}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer" style={{ fontSize: "13px" }}>Đóng</button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "13px" }}
            onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất PDF báo cáo sự cố...")); }}>
            <Download className="w-3.5 h-3.5" /> Xuất PDF
          </button>
        </div>
      </div>
    </div>
  );
}