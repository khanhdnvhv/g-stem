import { useState, useMemo } from "react";
import {
  Search, Filter, Clock, CheckCircle, XCircle, AlertTriangle,
  FileText, Users, Building2, Calendar, DollarSign,
  ChevronDown, ChevronUp, MessageSquare, Send,
} from "lucide-react";
import {
  BUDGET_REQUESTS, REQUEST_STATUS_CONFIG, REQUEST_PRIORITY_CONFIG,
  formatCurrency,
  type BudgetRequest, type RequestStatus,
} from "./mock-data";

interface BudgetRequestsProps {
  isAdmin: boolean;
}

const STATUS_ICONS: Record<RequestStatus, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  revision: AlertTriangle,
};

export function BudgetRequests({ isAdmin }: BudgetRequestsProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, RequestStatus>>({});

  const getEffectiveStatus = (req: BudgetRequest): RequestStatus => statusOverrides[req.id] || req.status;

  const handleAction = (id: string, action: RequestStatus) => {
    setStatusOverrides(prev => ({ ...prev, [id]: action }));
    const msgs: Record<string, string> = {
      approved: "Đã phê duyệt yêu cầu ngân sách!",
      rejected: "Đã từ chối yêu cầu ngân sách.",
      revision: "Đã yêu cầu bổ sung thông tin.",
    };
    import("sonner").then(m => m.toast.success(msgs[action] || "Đã cập nhật"));
  };

  const filtered = useMemo(() => {
    return BUDGET_REQUESTS.filter(r => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.title.toLowerCase().includes(q) && !r.subsidiary.toLowerCase().includes(q) && !r.requestedBy.toLowerCase().includes(q)) return false;
      }
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      return true;
    });
  }, [search, filterStatus]);

  // Stats
  const stats = {
    total: BUDGET_REQUESTS.length,
    pending: BUDGET_REQUESTS.filter(r => r.status === "pending").length,
    approved: BUDGET_REQUESTS.filter(r => r.status === "approved").length,
    totalPending: BUDGET_REQUESTS.filter(r => r.status === "pending").reduce((s, r) => s + r.amount, 0),
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Tổng đề xuất", value: stats.total, color: "#990803" },
          { label: "Chờ duyệt", value: stats.pending, color: "#f59e0b" },
          { label: "Đã duyệt", value: stats.approved, color: "#16a34a" },
          { label: "Tổng chờ duyệt", value: formatCurrency(stats.totalPending, true), color: "#2563eb" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: s.color }} />
            <div>
              <p style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm đề xuất..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
            style={{ fontSize: "13px" }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none"
          style={{ fontSize: "12px" }}
        >
          <option value="all">Tất cả trạng thái</option>
          {(Object.keys(REQUEST_STATUS_CONFIG) as RequestStatus[]).map(st => (
            <option key={st} value={st}>{REQUEST_STATUS_CONFIG[st].label}</option>
          ))}
        </select>
      </div>

      {/* Request cards */}
      <div className="space-y-2">
        {filtered.map(req => {
          const stCfg = REQUEST_STATUS_CONFIG[getEffectiveStatus(req)];
          const prCfg = REQUEST_PRIORITY_CONFIG[req.priority];
          const StIcon = STATUS_ICONS[getEffectiveStatus(req)];
          const isExpanded = expandedId === req.id;

          return (
            <div key={req.id} className={`bg-white rounded-xl border transition-all ${isExpanded ? "border-[#990803]/30 shadow-sm" : "border-gray-200"}`}>
              {/* Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : req.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: stCfg.bg }}>
                    <StIcon className="w-4.5 h-4.5" style={{ color: stCfg.color, width: "18px", height: "18px" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{req.title}</span>
                      <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
                        {stCfg.label}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-gray-50" style={{ fontSize: "9px", fontWeight: 600, color: prCfg.color }}>
                        {prCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400" style={{ fontSize: "11px" }}>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {req.subsidiary}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {req.employeeCount} người</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.createdAt}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[#990803]" style={{ fontSize: "16px", fontWeight: 700 }}>{formatCurrency(req.amount, true)}</p>
                    <p className="text-gray-300" style={{ fontSize: "10px" }}>{req.requestedBy}</p>
                  </div>

                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
                  {/* Justification */}
                  <div>
                    <p className="text-gray-400 mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>LÝ DO ĐỀ XUẤT</p>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg" style={{ fontSize: "13px", lineHeight: 1.6 }}>
                      {req.justification}
                    </p>
                  </div>

                  {/* Courses */}
                  <div>
                    <p className="text-gray-400 mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>KHÓA HỌC LIÊN QUAN</p>
                    <div className="flex flex-wrap gap-1.5">
                      {req.courseNames.map(c => (
                        <span key={c} className="px-2 py-0.5 bg-[#990803]/5 text-[#990803] rounded-full" style={{ fontSize: "11px" }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cost breakdown */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>Tổng đề xuất</p>
                      <p className="text-gray-700" style={{ fontSize: "15px", fontWeight: 700 }}>{formatCurrency(req.amount)}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>Chi phí/Người</p>
                      <p className="text-gray-700" style={{ fontSize: "15px", fontWeight: 700 }}>
                        {formatCurrency(Math.round(req.amount / req.employeeCount), true)}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>Phòng ban</p>
                      <p className="text-gray-600" style={{ fontSize: "13px", fontWeight: 500 }}>{req.department}</p>
                    </div>
                  </div>

                  {/* Review notes */}
                  {req.reviewNotes && (
                    <div className={`p-3 rounded-lg border ${req.status === "approved" ? "bg-green-50 border-green-100" : req.status === "rejected" ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <MessageSquare className="w-3 h-3" style={{ color: stCfg.color }} />
                        <span style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color }}>
                          Nhận xét từ {req.reviewedBy} — {req.reviewedAt}
                        </span>
                      </div>
                      <p className="text-gray-600" style={{ fontSize: "12.5px", lineHeight: 1.5 }}>
                        {req.reviewNotes}
                      </p>
                    </div>
                  )}

                  {/* Admin actions */}
                  {isAdmin && getEffectiveStatus(req) === "pending" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button onClick={() => handleAction(req.id, "approved")} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Phê duyệt
                      </button>
                      <button onClick={() => handleAction(req.id, "revision")} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                        <AlertTriangle className="w-3.5 h-3.5" /> Yêu cầu bổ sung
                      </button>
                      <button onClick={() => handleAction(req.id, "rejected")} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                        <XCircle className="w-3.5 h-3.5" /> Từ chối
                      </button>
                      <div className="flex-1" />
                      <textarea
                        placeholder="Ghi chú phê duyệt..."
                        rows={1}
                        className="flex-1 max-w-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none resize-none"
                        style={{ fontSize: "12px" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400" style={{ fontSize: "14px" }}>Không có đề xuất nào</p>
        </div>
      )}
    </div>
  );
}