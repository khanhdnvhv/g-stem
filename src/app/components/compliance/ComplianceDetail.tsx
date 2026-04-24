import { useState, useMemo } from "react";
import {
  ArrowLeft, Search, Download, Send, Filter,
  CheckCircle, Clock, AlertTriangle, XCircle, Minus,
  Building2, Calendar, Users, Shield, BarChart3,
} from "lucide-react";
import {
  COMPLIANCE_PROGRAMS, PROGRAM_TYPE_CONFIG, RISK_LEVEL_CONFIG,
  FREQUENCY_CONFIG, COMPLIANCE_STATUS_CONFIG,
  getEmployeeCompliance,
  type ComplianceProgram, type ComplianceStatus,
} from "./mock-data";

interface ComplianceDetailProps {
  programId: string;
  onBack: () => void;
}

const STATUS_ICONS: Record<ComplianceStatus, React.ElementType> = {
  compliant: CheckCircle,
  expiring_soon: Clock,
  overdue: AlertTriangle,
  not_started: XCircle,
  exempt: Minus,
};

export function ComplianceDetail({ programId, onBack }: ComplianceDetailProps) {
  const program = COMPLIANCE_PROGRAMS.find(p => p.id === programId);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | "all">("all");

  const employees = useMemo(() => getEmployeeCompliance(programId), [programId]);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      if (search) {
        const q = search.toLowerCase();
        if (!e.name.toLowerCase().includes(q) && !e.department.toLowerCase().includes(q) && !e.subsidiary.toLowerCase().includes(q)) return false;
      }
      if (filterStatus !== "all" && e.status !== filterStatus) return false;
      return true;
    });
  }, [employees, search, filterStatus]);

  if (!program) return null;

  const rate = Math.round((program.totalCompliant / program.totalRequired) * 100);
  const tCfg = PROGRAM_TYPE_CONFIG[program.type];
  const rCfg = RISK_LEVEL_CONFIG[program.riskLevel];
  const fCfg = FREQUENCY_CONFIG[program.frequency];

  // Status counts from employees
  const statusCounts = employees.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-3">
          <button onClick={onBack} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer mt-0.5">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="mt-1" style={{ fontSize: "28px" }}>{tCfg.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{program.name}</h2>
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: rCfg.color, backgroundColor: rCfg.bg }}>
                Rủi ro: {rCfg.label}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500" style={{ fontSize: "10px", fontWeight: 500 }}>
                {fCfg.label}
              </span>
            </div>
            <p className="text-gray-500 mb-2" style={{ fontSize: "13px" }}>{program.description}</p>
            <div className="flex items-center gap-4 text-gray-400" style={{ fontSize: "11px" }}>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {program.requiredBy}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Hạn tiếp theo: {program.nextDeadline}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {program.totalRequired.toLocaleString()} nhân viên</span>
            </div>

            {/* Warning */}
            <div className="mt-3 p-2.5 bg-red-50 rounded-lg border border-red-100">
              <p className="text-red-700" style={{ fontSize: "11px" }}>
                <span style={{ fontWeight: 600 }}>⚠ Hậu quả vi phạm:</span> {program.penaltyNote}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-center px-4">
            <ComplianceRing rate={rate} size={80} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {(Object.keys(COMPLIANCE_STATUS_CONFIG) as ComplianceStatus[]).map(st => {
          const cfg = COMPLIANCE_STATUS_CONFIG[st];
          const count = statusCounts[st] || 0;
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(filterStatus === st ? "all" : st)}
              className={`bg-white rounded-xl border p-3 flex items-center gap-2.5 cursor-pointer transition-all ${filterStatus === st ? "border-[#990803] shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
            >
              <span className="text-lg">{cfg.icon}</span>
              <div className="text-left">
                <p style={{ fontSize: "18px", fontWeight: 700, color: cfg.color }}>{count}</p>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{cfg.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Distribution chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bố Trạng thái</h3>
        <StatusDistribution counts={statusCounts} total={employees.length} />
      </div>

      {/* Employee table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm nhân viên..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
              style={{ fontSize: "13px" }}
            />
          </div>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đã gửi nhắc nhở tuân thủ cho tất cả nhân sự!")); }} className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer flex items-center gap-1" style={{ fontSize: "12px" }}>
            <Send className="w-3.5 h-3.5" /> Gửi nhắc nhở
          </button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer flex items-center gap-1" style={{ fontSize: "12px" }}
            onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất báo cáo tuân thủ...")); }}>
            <Download className="w-3.5 h-3.5" /> Xuất Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>NHÂN VIÊN</th>
                <th className="text-left px-3 py-2.5 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>PHÒNG BAN</th>
                <th className="text-left px-3 py-2.5 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>ĐƠN VỊ</th>
                <th className="text-center px-3 py-2.5 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>TRẠNG THÁI</th>
                <th className="text-center px-3 py-2.5 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>HOÀN THÀNH</th>
                <th className="text-center px-3 py-2.5 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>HẾT HẠN</th>
                <th className="text-center px-3 py-2.5 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>ĐIỂM</th>
                <th className="text-center px-3 py-2.5 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>LẦN THI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const stCfg = COMPLIANCE_STATUS_CONFIG[emp.status];
                const StIcon = STATUS_ICONS[emp.status];
                return (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500" style={{ fontSize: "9px", fontWeight: 700 }}>
                          {emp.name.split(" ").map(w => w[0]).slice(-2).join("")}
                        </div>
                        <div>
                          <p className="text-gray-700" style={{ fontSize: "12.5px", fontWeight: 500 }}>{emp.name}</p>
                          <p className="text-gray-300" style={{ fontSize: "10px" }}>{emp.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500" style={{ fontSize: "12px" }}>{emp.department}</td>
                    <td className="px-3 py-2.5 text-gray-500" style={{ fontSize: "12px" }}>{emp.subsidiary}</td>
                    <td className="text-center px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
                        <StIcon className="w-3 h-3" />
                        {stCfg.label}
                      </span>
                    </td>
                    <td className="text-center px-3 py-2.5 text-gray-500" style={{ fontSize: "12px" }}>
                      {emp.completedDate || "—"}
                    </td>
                    <td className="text-center px-3 py-2.5" style={{ fontSize: "12px", color: emp.status === "expiring_soon" ? "#f59e0b" : emp.status === "overdue" ? "#dc2626" : "#6b7280" }}>
                      {emp.expiryDate || emp.dueDate}
                    </td>
                    <td className="text-center px-3 py-2.5" style={{ fontSize: "12px", fontWeight: 600, color: emp.score ? (emp.score >= 80 ? "#16a34a" : emp.score >= 60 ? "#f59e0b" : "#dc2626") : "#d1d5db" }}>
                      {emp.score ? `${emp.score}` : "—"}
                    </td>
                    <td className="text-center px-3 py-2.5 text-gray-500" style={{ fontSize: "12px" }}>
                      {emp.attempts || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400" style={{ fontSize: "13px" }}>Không tìm thấy nhân viên nào</p>
          </div>
        )}

        <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-gray-400" style={{ fontSize: "11px" }}>Hiển thị {filtered.length}/{employees.length} nhân viên</span>
        </div>
      </div>
    </div>
  );
}

// ─── SVG Sub-components ───

function ComplianceRing({ rate, size }: { rate: number; size: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38, sw = 8;
  const circ = 2 * Math.PI * r;
  const filled = (rate / 100) * circ;
  const color = rate >= 80 ? "#16a34a" : rate >= 60 ? "#f59e0b" : "#dc2626";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={`${filled} ${circ}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central" fill={color} style={{ fontSize: `${size * 0.25}px`, fontWeight: 700 }}>
        {rate}%
      </text>
    </svg>
  );
}

function StatusDistribution({ counts, total }: { counts: Record<string, number>; total: number }) {
  const H = 28;
  const statuses: ComplianceStatus[] = ["compliant", "expiring_soon", "overdue", "not_started", "exempt"];
  let offset = 0;

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 100 ${H}`} preserveAspectRatio="none">
        {statuses.map(st => {
          const count = counts[st] || 0;
          const pct = (count / total) * 100;
          const cfg = COMPLIANCE_STATUS_CONFIG[st];
          const x = offset;
          offset += pct;
          if (pct === 0) return null;
          return (
            <rect key={st} x={`${x}%`} y="0" width={`${pct}%`} height={H} fill={cfg.color} opacity="0.7" rx="0" />
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-2">
        {statuses.map(st => {
          const count = counts[st] || 0;
          if (count === 0) return null;
          const cfg = COMPLIANCE_STATUS_CONFIG[st];
          return (
            <div key={st} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: cfg.color, opacity: 0.7 }} />
              <span className="text-gray-500" style={{ fontSize: "10px" }}>{cfg.label}: {count} ({Math.round((count / total) * 100)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}