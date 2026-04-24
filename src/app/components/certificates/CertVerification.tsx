import { useState, useMemo } from "react";
import { copyToClipboard } from "../../utils/clipboard";
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, Search,
  QrCode, Globe, Wifi, Clock, Hash, User, GraduationCap,
  Building2, Calendar, Award, ExternalLink, Copy, Filter,
  ArrowUpRight, Activity,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { MOCK_VERIFY_LOGS, MOCK_CERT_RECORDS } from "./cert-mock-data";
import { DEFAULT_TEMPLATES, CertificatePreviewSVG } from "./CertPreview";

const SOURCE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  qr: { label: "QR Code", icon: QrCode, color: "#8b5cf6" },
  web: { label: "Website", icon: Globe, color: "#3b82f6" },
  api: { label: "API", icon: Wifi, color: "#22c55e" },
};

const RESULT_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  valid: { color: "#22c55e", bg: "#22c55e10", label: "Hợp lệ", icon: CheckCircle2 },
  expired: { color: "#6b7280", bg: "#6b728010", label: "Hết hạn", icon: Clock },
  revoked: { color: "#ef4444", bg: "#ef444410", label: "Thu hồi", icon: XCircle },
  not_found: { color: "#f59e0b", bg: "#f59e0b10", label: "Không tìm thấy", icon: AlertTriangle },
};

// QR Code SVG component (simulated QR pattern)
function QRCodeSVG({ value, size = 140 }: { value: string; size?: number }) {
  // Generate deterministic pseudo-random pattern from value
  const cells = 21;
  const cellSize = size / cells;
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return h;
  };
  const seed = hash(value);
  const grid: boolean[][] = [];
  for (let r = 0; r < cells; r++) {
    grid[r] = [];
    for (let c = 0; c < cells; c++) {
      // Finder patterns (top-left, top-right, bottom-left)
      const inFinderTL = r < 7 && c < 7;
      const inFinderTR = r < 7 && c >= cells - 7;
      const inFinderBL = r >= cells - 7 && c < 7;
      if (inFinderTL || inFinderTR || inFinderBL) {
        const lr = inFinderTL ? r : inFinderTR ? r : r - (cells - 7);
        const lc = inFinderTL ? c : inFinderTR ? c - (cells - 7) : c;
        grid[r][c] = (lr === 0 || lr === 6 || lc === 0 || lc === 6) ||
          (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else {
        grid[r][c] = ((seed * (r * cells + c + 1) * 7919) & 0xffff) % 3 !== 0;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx="4" />
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#1a1a1a" />
          ) : null
        )
      )}
    </svg>
  );
}

export function CertVerification() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";

  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<null | { found: boolean; cert?: any; record?: any }>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logSourceFilter, setLogSourceFilter] = useState("all");
  const [logResultFilter, setLogResultFilter] = useState("all");
  const [copied, setCopied] = useState(false);

  const doVerify = () => {
    if (!verifyInput.trim()) return;
    const foundLog = MOCK_VERIFY_LOGS.find(v => v.certificateNo.toLowerCase() === verifyInput.toLowerCase() && v.result === "valid");
    const foundRecord = MOCK_CERT_RECORDS.find(r => r.certificateNo.toLowerCase() === verifyInput.toLowerCase());
    if (foundLog || (foundRecord && foundRecord.status === "issued")) {
      setVerifyResult({ found: true, cert: foundLog, record: foundRecord });
    } else if (foundRecord && foundRecord.status === "expired") {
      setVerifyResult({ found: false, cert: { ...foundRecord, result: "expired" } });
    } else if (foundRecord && foundRecord.status === "revoked") {
      setVerifyResult({ found: false, cert: { ...foundRecord, result: "revoked" } });
    } else {
      setVerifyResult({ found: false });
    }
  };

  const copyLink = (certNo: string) => {
    copyToClipboard(`https://lms.geleximco.vn/verify/${certNo}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Verification stats
  const stats = useMemo(() => {
    const total = MOCK_VERIFY_LOGS.length;
    const valid = MOCK_VERIFY_LOGS.filter(l => l.result === "valid").length;
    const invalid = total - valid;
    const bySource = { qr: 0, web: 0, api: 0 };
    MOCK_VERIFY_LOGS.forEach(l => { bySource[l.source as keyof typeof bySource]++; });
    return { total, valid, invalid, bySource };
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return MOCK_VERIFY_LOGS.filter(l => {
      const q = logSearch.toLowerCase();
      const matchSearch = !q || l.certificateNo.toLowerCase().includes(q) || l.studentName.toLowerCase().includes(q);
      const matchSource = logSourceFilter === "all" || l.source === logSourceFilter;
      const matchResult = logResultFilter === "all" || l.result === logResultFilter;
      return matchSearch && matchSource && matchResult;
    });
  }, [logSearch, logSourceFilter, logResultFilter]);

  return (
    <div className="space-y-5">
      {/* Public Verification Hero */}
      <div className="bg-gradient-to-br from-[#990803]/5 via-white to-[#c8a84e]/5 rounded-2xl border border-[#990803]/10 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5">
          <Shield className="w-48 h-48 text-[#990803]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>
                Xác thực Chứng chỉ Geleximco
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                Nhập mã chứng chỉ hoặc scan QR code để kiểm tra tính hợp lệ và xác thực nguồn gốc
              </p>
            </div>
          </div>

          {/* Verification Input */}
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={verifyInput}
                onChange={e => setVerifyInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doVerify()}
                placeholder="Nhập mã chứng chỉ, ví dụ: GXC-2026-00001"
                className="w-full pl-10 pr-4 py-3.5 bg-white rounded-xl border border-border shadow-sm focus:ring-2 focus:ring-green-500/20 focus:outline-none focus:border-green-400 transition-all"
                style={{ fontSize: "14px" }}
              />
            </div>
            <button
              onClick={doVerify}
              className="px-8 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors cursor-pointer shadow-sm"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Xác thực
            </button>
          </div>

          {/* Quick hint */}
          <div className="mt-2 flex items-center gap-4 flex-wrap">
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Thử nhanh:</span>
            {["GXC-2026-00001", "GXC-2026-00003", "GXC-2026-00005"].map(code => (
              <button
                key={code}
                onClick={() => { setVerifyInput(code); }}
                className="px-2 py-0.5 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors cursor-pointer"
                style={{ fontSize: "10px", fontWeight: 500 }}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Result */}
      {verifyResult && (
        <div className={`rounded-2xl border-2 overflow-hidden ${verifyResult.found ? "border-green-300 bg-green-50/50" : "border-red-300 bg-red-50/50"}`}>
          {/* Result header */}
          <div className={`p-4 flex items-center gap-3 ${verifyResult.found ? "bg-green-100/50" : "bg-red-100/50"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${verifyResult.found ? "bg-green-500" : "bg-red-500"}`}>
              {verifyResult.found ? <CheckCircle2 className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1">
              <h4 style={{ fontSize: "16px", fontWeight: 700, color: verifyResult.found ? "#166534" : "#991b1b" }}>
                {verifyResult.found ? "Chứng chỉ HỢP LỆ" : "Không xác thực được"}
              </h4>
              <p style={{ fontSize: "12px", color: verifyResult.found ? "#15803d" : "#dc2626" }}>
                {verifyResult.found
                  ? "Chứng chỉ này được cấp bởi Tập đoàn Geleximco và đang còn hiệu lực"
                  : "Mã chứng chỉ không tồn tại hoặc đã hết hiệu lực. Vui lòng kiểm tra lại."}
              </p>
            </div>
            {verifyResult.found && verifyResult.record && (
              <button onClick={() => setShowPreview(!showPreview)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>
                {showPreview ? "Ẩn xem trước" : "Xem chứng chỉ"}
              </button>
            )}
          </div>

          {/* Certificate details if found */}
          {verifyResult.found && verifyResult.record && (
            <div className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Info grid */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: User, label: "Học viên", value: verifyResult.record.studentName },
                      { icon: GraduationCap, label: "Khóa học", value: verifyResult.record.courseName },
                      { icon: Building2, label: "Đơn vị", value: verifyResult.record.subsidiary?.length > 30 ? verifyResult.record.subsidiary.slice(0, 30) + "..." : verifyResult.record.subsidiary },
                      { icon: Hash, label: "Mã chứng chỉ", value: verifyResult.record.certificateNo },
                      { icon: Calendar, label: "Ngày cấp", value: new Date(verifyResult.record.issuedAt).toLocaleDateString("vi-VN") },
                      { icon: Calendar, label: "Hết hạn", value: new Date(verifyResult.record.expiryDate).toLocaleDateString("vi-VN") },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-green-100">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-green-600" style={{ fontSize: "9px", fontWeight: 500 }}>{item.label}</p>
                          <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Verification link */}
                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-green-100">
                    <Globe className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-foreground truncate font-mono" style={{ fontSize: "11px" }}>
                      {verifyResult.record.verificationUrl}
                    </span>
                    <button onClick={() => copyLink(verifyResult.record.certificateNo)} className="px-2 py-1 bg-green-50 rounded text-green-600 hover:bg-green-100 transition-colors cursor-pointer shrink-0" style={{ fontSize: "10px", fontWeight: 500 }}>
                      <Copy className="w-3 h-3 inline mr-1" />
                      {copied ? "Đã sao chép!" : "Sao chép"}
                    </button>
                  </div>

                  {/* Preview */}
                  {showPreview && (
                    <div className="bg-white rounded-xl border border-green-100 p-4">
                      <CertificatePreviewSVG
                        template={DEFAULT_TEMPLATES.find(t => t.id === verifyResult.record.templateId) || DEFAULT_TEMPLATES[0]}
                        studentName={verifyResult.record.studentName}
                        courseName={verifyResult.record.courseName}
                        score={verifyResult.record.score}
                        issuedDate={new Date(verifyResult.record.issuedAt).toLocaleDateString("vi-VN")}
                        expiryDate={new Date(verifyResult.record.expiryDate).toLocaleDateString("vi-VN")}
                        certNo={verifyResult.record.certificateNo}
                      />
                    </div>
                  )}
                </div>

                {/* QR Code side */}
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm">
                    <QRCodeSVG value={verifyResult.record.verificationUrl} size={160} />
                  </div>
                  <p className="text-green-700 text-center" style={{ fontSize: "10px", fontWeight: 500 }}>
                    Scan QR để xác thực nhanh
                  </p>
                  <div className="flex items-center gap-1.5 text-green-600">
                    <Shield className="w-3.5 h-3.5" />
                    <span style={{ fontSize: "10px", fontWeight: 600 }}>Xác thực bởi Geleximco LMS</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin-only sections */}
      {isAdmin && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Tổng lượt xác thực", value: stats.total, icon: Activity, color: "#990803" },
              { label: "Hợp lệ", value: stats.valid, icon: CheckCircle2, color: "#22c55e" },
              { label: "Không hợp lệ", value: stats.invalid, icon: AlertTriangle, color: "#ef4444" },
              { label: "Qua QR Code", value: stats.bySource.qr, icon: QrCode, color: "#8b5cf6" },
              { label: "Qua Website/API", value: stats.bySource.web + stats.bySource.api, icon: Globe, color: "#3b82f6" },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}10` }}>
                    <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{stat.value}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Verification source chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bổ theo nguồn xác thực</h4>
            <div className="flex items-center gap-8">
              {/* Donut chart */}
              <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0">
                {(() => {
                  const data = [
                    { value: stats.bySource.qr, color: "#8b5cf6" },
                    { value: stats.bySource.web, color: "#3b82f6" },
                    { value: stats.bySource.api, color: "#22c55e" },
                  ];
                  const total = data.reduce((s, d) => s + d.value, 0);
                  let cumAngle = -90;
                  return data.map((d, i) => {
                    const angle = (d.value / total) * 360;
                    const startRad = (cumAngle * Math.PI) / 180;
                    const endRad = ((cumAngle + angle) * Math.PI) / 180;
                    const largeArc = angle > 180 ? 1 : 0;
                    const x1 = 60 + 45 * Math.cos(startRad);
                    const y1 = 60 + 45 * Math.sin(startRad);
                    const x2 = 60 + 45 * Math.cos(endRad);
                    const y2 = 60 + 45 * Math.sin(endRad);
                    const ix1 = 60 + 25 * Math.cos(endRad);
                    const iy1 = 60 + 25 * Math.sin(endRad);
                    const ix2 = 60 + 25 * Math.cos(startRad);
                    const iy2 = 60 + 25 * Math.sin(startRad);
                    cumAngle += angle;
                    return (
                      <path
                        key={i}
                        d={`M${x1},${y1} A45,45 0 ${largeArc},1 ${x2},${y2} L${ix1},${iy1} A25,25 0 ${largeArc},0 ${ix2},${iy2} Z`}
                        fill={d.color}
                        opacity="0.85"
                      />
                    );
                  });
                })()}
                <text x="60" y="57" textAnchor="middle" fill="#374151" fontSize="16" fontWeight="700">{stats.total}</text>
                <text x="60" y="70" textAnchor="middle" fill="#9ca3af" fontSize="8">lượt</text>
              </svg>

              {/* Legend */}
              <div className="flex-1 space-y-3">
                {Object.entries(SOURCE_LABELS).map(([key, cfg]) => {
                  const count = stats.bySource[key as keyof typeof stats.bySource];
                  const pct = Math.round((count / stats.total) * 100);
                  const Icon = cfg.icon;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}15` }}>
                        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{cfg.label}</span>
                          <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 700 }}>{count} <span className="text-muted-foreground" style={{ fontWeight: 400 }}>({pct}%)</span></span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cfg.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Verification Logs */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Lịch sử Xác thực</h3>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{filteredLogs.length}/{MOCK_VERIFY_LOGS.length} bản ghi</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={e => setLogSearch(e.target.value)}
                    placeholder="Tìm theo mã CC, tên..."
                    className="w-full pl-9 pr-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none"
                    style={{ fontSize: "12px" }}
                  />
                </div>
                <select
                  value={logSourceFilter}
                  onChange={e => setLogSourceFilter(e.target.value)}
                  className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer"
                  style={{ fontSize: "12px" }}
                >
                  <option value="all">Tất cả nguồn</option>
                  <option value="qr">QR Code</option>
                  <option value="web">Website</option>
                  <option value="api">API</option>
                </select>
                <select
                  value={logResultFilter}
                  onChange={e => setLogResultFilter(e.target.value)}
                  className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer"
                  style={{ fontSize: "12px" }}
                >
                  <option value="all">Tất cả kết quả</option>
                  <option value="valid">Hợp lệ</option>
                  <option value="expired">Hết hạn</option>
                  <option value="revoked">Thu hồi</option>
                  <option value="not_found">Không tìm thấy</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-border/50">
              {filteredLogs.map(log => {
                const rc = RESULT_CONFIG[log.result];
                const sc = SOURCE_LABELS[log.source];
                const RIcon = rc.icon;
                const SIcon = sc.icon;
                return (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: rc.bg }}>
                      <RIcon className="w-4 h-4" style={{ color: rc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-foreground font-mono" style={{ fontSize: "12px", fontWeight: 600 }}>{log.certificateNo}</span>
                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: rc.color, background: rc.bg }}>
                          {log.result === "valid" ? "Hợp lệ" : log.result === "expired" ? "Hết hạn" : log.result === "revoked" ? "Thu hồi" : "Không tìm thấy"}
                        </span>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 500, color: sc.color, background: `${sc.color}10` }}>
                          <SIcon className="w-2.5 h-2.5" /> {sc.label}
                        </span>
                      </div>
                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                        {log.studentName} &bull; IP: {log.ipAddress}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>{log.verifiedAt}</span>
                  </div>
                );
              })}
            </div>

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="mt-2 text-muted-foreground" style={{ fontSize: "13px" }}>Không tìm thấy bản ghi nào</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Public info for non-admin */}
      {!isAdmin && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Cách xác thực chứng chỉ</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "1", icon: Hash, title: "Nhập mã chứng chỉ", desc: "Nhập mã số in trên chứng chỉ vào ô tìm kiếm phía trên" },
              { step: "2", icon: QrCode, title: "Hoặc scan QR Code", desc: "Scan mã QR trên chứng chỉ bằng điện thoại để truy cập trang xác thực" },
              { step: "3", icon: CheckCircle2, title: "Xem kết quả", desc: "Hệ thống sẽ hiển thị thông tin chi tiết và tình trạng hiệu lực" },
            ].map(item => (
              <div key={item.step} className="flex gap-3 p-4 bg-secondary/30 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[#990803]/10 flex items-center justify-center shrink-0 text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>
                  {item.step}
                </div>
                <div>
                  <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{item.title}</p>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}