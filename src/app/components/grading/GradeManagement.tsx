import { useState } from "react";
import {
  ShieldCheck, AlertTriangle, Edit3, CheckCircle, XCircle,
  Search, ChevronDown, ChevronRight, MessageSquare, Scale,
  Users, Lock, Settings, Save, Eye, ArrowRight, Gavel,
} from "lucide-react";
import {
  MOCK_APPEALS, MOCK_INSTRUCTOR_METRICS, DEFAULT_GRADING_POLICY,
  type GradeAppeal, type AppealStatus, type GradingPolicy,
} from "./mock-data";
import { toast } from "@/app/lib/toast";

const APPEAL_STATUS_CONFIG: Record<AppealStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Chờ xử lý", color: "#f59e0b", bg: "#fef3c7" },
  reviewing: { label: "Đang xem xét", color: "#3b82f6", bg: "#dbeafe" },
  resolved: { label: "Đã giải quyết", color: "#22c55e", bg: "#dcfce7" },
  rejected: { label: "Từ chối", color: "#dc2626", bg: "#fee2e2" },
};

export function GradeManagement() {
  const [activeSection, setActiveSection] = useState<"appeals" | "override" | "policies" | "cross_grading">("appeals");
  const [appeals, setAppeals] = useState(MOCK_APPEALS);
  const [expandedAppeal, setExpandedAppeal] = useState<string | null>(null);
  const [policy, setPolicy] = useState<GradingPolicy>(DEFAULT_GRADING_POLICY);
  const [overrideSearch, setOverrideSearch] = useState("");
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [policySaved, setPolicySaved] = useState(false);

  const pendingAppeals = appeals.filter(a => a.status === "pending" || a.status === "reviewing").length;

  const handleResolveAppeal = (id: string, action: "resolve" | "reject", newScore?: number) => {
    setAppeals(prev => prev.map(a => {
      if (a.id !== id) return a;
      return {
        ...a,
        status: (action === "resolve" ? "resolved" : "rejected") as AppealStatus,
        resolvedAt: "2026-03-12 15:00",
        resolvedBy: "Nguyễn Văn Minh (Admin)",
        newScore: action === "resolve" ? (newScore || a.currentScore + 10) : null,
        resolution: action === "resolve" ? "Đã xem xét và điều chỉnh điểm." : "Giữ nguyên điểm sau khi xem xét kỹ.",
      };
    }));
  };

  const handleSavePolicy = () => {
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 2000);
  };

  const sections = [
    { key: "appeals", label: "Khiếu nại Điểm", icon: Gavel, badge: String(pendingAppeals) },
    { key: "override", label: "Override Điểm", icon: Edit3 },
    { key: "policies", label: "Chính sách Chấm", icon: Settings },
    { key: "cross_grading", label: "Chấm chéo", icon: Users },
  ];

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {sections.map(s => {
          const Icon = s.icon;
          const isActive = activeSection === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                isActive ? "bg-[#990803] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              style={{ fontSize: "12px", fontWeight: isActive ? 600 : 500 }}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
              {s.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-red-50 text-red-500"}`}
                  style={{ fontSize: "10px", fontWeight: 700 }}
                >
                  {s.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* === APPEALS SECTION === */}
      {activeSection === "appeals" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-500" style={{ fontSize: "13px" }}>
              {appeals.length} khiếu nại • {pendingAppeals} chờ xử lý
            </p>
          </div>

          {appeals.map(appeal => {
            const sc = APPEAL_STATUS_CONFIG[appeal.status];
            const isExpanded = expandedAppeal === appeal.id;
            const isPending = appeal.status === "pending" || appeal.status === "reviewing";

            return (
              <div key={appeal.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedAppeal(isExpanded ? null : appeal.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ fontSize: "11px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
                    >
                      {appeal.studentName.split(" ").map(w => w[0]).slice(-2).join("")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{appeal.studentName}</span>
                        <span
                          className="px-1.5 py-0.5 rounded-full"
                          style={{ fontSize: "10px", fontWeight: 600, color: sc.color, backgroundColor: sc.bg }}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-gray-500 mt-0.5" style={{ fontSize: "12px" }}>
                        {appeal.assignmentTitle} — {appeal.courseName.length > 35 ? appeal.courseName.slice(0, 33) + "..." : appeal.courseName}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-gray-400" style={{ fontSize: "11px" }}>
                        <span>Điểm hiện tại: <span className="text-red-500" style={{ fontWeight: 600 }}>{appeal.currentScore}/{appeal.maxScore}</span></span>
                        <span>|</span>
                        <span>GV: {appeal.instructorName}</span>
                        <span>|</span>
                        <span>{appeal.filedAt}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50/30 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-500 mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>Lý do khiếu nại:</p>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-700" style={{ fontSize: "12.5px" }}>{appeal.reason}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>Bằng chứng:</p>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-700" style={{ fontSize: "12.5px" }}>{appeal.evidence}</p>
                        </div>
                      </div>
                    </div>

                    {appeal.resolution && (
                      <div>
                        <p className="text-gray-500 mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>Kết quả xử lý:</p>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-green-800" style={{ fontSize: "12.5px" }}>{appeal.resolution}</p>
                          {appeal.newScore !== null && (
                            <p className="text-green-600 mt-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                              Điểm mới: {appeal.newScore}/{appeal.maxScore} (từ {appeal.currentScore})
                            </p>
                          )}
                          <p className="text-green-500 mt-1" style={{ fontSize: "10.5px" }}>
                            Bởi {appeal.resolvedBy} — {appeal.resolvedAt}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action buttons for pending appeals */}
                    {isPending && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleResolveAppeal(appeal.id, "resolve")}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-1.5"
                          style={{ fontSize: "12px", fontWeight: 500 }}
                        >
                          <CheckCircle className="w-4 h-4" /> Chấp nhận & Sửa điểm (+10)
                        </button>
                        <button
                          onClick={() => handleResolveAppeal(appeal.id, "reject")}
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5"
                          style={{ fontSize: "12px", fontWeight: 500 }}
                        >
                          <XCircle className="w-4 h-4" /> Giữ nguyên điểm
                        </button>
                        <button
                          className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1.5"
                          style={{ fontSize: "12px", fontWeight: 500 }}
                        >
                          <Users className="w-4 h-4" /> Giao GV khác chấm lại
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* === OVERRIDE SECTION === */}
      {activeSection === "override" && (
        <div className="space-y-4">
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-orange-700" style={{ fontSize: "12px" }}>
              Override điểm sẽ được ghi nhận vào audit log. Lý do bắt buộc phải nhập.
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-gray-700" style={{ fontSize: "15px", fontWeight: 600 }}>Override Điểm số</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Tìm học viên</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={overrideSearch} onChange={e => setOverrideSearch(e.target.value)}
                    placeholder="Nhập tên, mã học viên..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                    style={{ fontSize: "13px" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Điểm mới</label>
                <input
                  type="number" min={0} max={100} value={overrideScore}
                  onChange={e => setOverrideScore(e.target.value)}
                  placeholder="0-100"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>

            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                Lý do override <span className="text-red-500">*</span>
              </label>
              <textarea
                value={overrideReason} onChange={e => setOverrideReason(e.target.value)}
                placeholder="Bắt buộc nhập lý do chi tiết..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20 resize-none"
                style={{ fontSize: "13px" }}
                rows={3}
              />
            </div>

            <button
              disabled={!overrideSearch || !overrideScore || !overrideReason}
              className="px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 600 }}
              onClick={() => {
                toast.success(`Override điểm → ${overrideScore} cho "${overrideSearch}"\nLý do: ${overrideReason}`);
                setOverrideSearch(""); setOverrideScore(""); setOverrideReason("");
              }}
            >
              <ShieldCheck className="w-4 h-4" /> Xác nhận Override
            </button>
          </div>
        </div>
      )}

      {/* === POLICIES SECTION === */}
      {activeSection === "policies" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
            <h3 className="text-gray-700 flex items-center gap-1.5" style={{ fontSize: "15px", fontWeight: 600 }}>
              <Settings className="w-5 h-5 text-[#990803]" /> Chính sách Chấm điểm Tập đoàn
            </h3>

            {/* Scale */}
            <div>
              <label className="text-gray-600 block mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Thang điểm</label>
              <div className="flex gap-2">
                {[
                  { key: "100", label: "Thang 100" },
                  { key: "10", label: "Thang 10" },
                  { key: "letter", label: "Letter (A-F)" },
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setPolicy(p => ({ ...p, scale: s.key as any }))}
                    className={`flex-1 py-2 rounded-lg border-2 transition-all cursor-pointer text-center ${
                      policy.scale === s.key
                        ? "border-[#990803] bg-[#990803]/5 text-[#990803]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                    style={{ fontSize: "12px", fontWeight: policy.scale === s.key ? 600 : 400 }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Passing threshold */}
            <div>
              <label className="text-gray-600 block mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>
                Ngưỡng Đạt: <span className="text-[#990803]" style={{ fontSize: "14px" }}>{policy.passingThreshold}%</span>
              </label>
              <input
                type="range" min={40} max={80} value={policy.passingThreshold}
                onChange={e => setPolicy(p => ({ ...p, passingThreshold: parseInt(e.target.value) }))}
                className="w-full accent-[#990803]"
              />
              <div className="flex justify-between text-gray-400" style={{ fontSize: "10px" }}>
                <span>40%</span><span>60%</span><span>80%</span>
              </div>
            </div>

            {/* Weights */}
            <div>
              <label className="text-gray-600 block mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>
                Trọng số thành phần
                <span className={`ml-2 ${policy.weights.assignment + policy.weights.midterm + policy.weights.final === 100 ? "text-green-600" : "text-red-500"}`} style={{ fontSize: "11px" }}>
                  (Tổng: {policy.weights.assignment + policy.weights.midterm + policy.weights.final}%)
                </span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "assignment", label: "Bài tập" },
                  { key: "midterm", label: "Giữa kỳ" },
                  { key: "final", label: "Cuối kỳ" },
                ].map(w => (
                  <div key={w.key} className="bg-gray-50 rounded-lg p-3">
                    <label className="text-gray-500 block mb-1" style={{ fontSize: "11px" }}>{w.label}</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number" min={0} max={100}
                        value={policy.weights[w.key as keyof typeof policy.weights]}
                        onChange={e => setPolicy(p => ({
                          ...p,
                          weights: { ...p.weights, [w.key]: parseInt(e.target.value) || 0 },
                        }))}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-center bg-white focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                        style={{ fontSize: "14px", fontWeight: 600 }}
                      />
                      <span className="text-gray-400" style={{ fontSize: "12px" }}>%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-lock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Tự khóa sửa điểm sau
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={1} max={90} value={policy.autoLockDays}
                    onChange={e => setPolicy(p => ({ ...p, autoLockDays: parseInt(e.target.value) || 14 }))}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  />
                  <span className="text-gray-500" style={{ fontSize: "12px" }}>ngày</span>
                </div>
              </div>
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Yêu cầu Admin phê duyệt
                </label>
                <button
                  onClick={() => setPolicy(p => ({ ...p, requireApproval: !p.requireApproval }))}
                  className={`px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                    policy.requireApproval
                      ? "border-[#990803] bg-[#990803]/5 text-[#990803]"
                      : "border-gray-200 text-gray-500"
                  }`}
                  style={{ fontSize: "12px", fontWeight: 500 }}
                >
                  {policy.requireApproval ? "✓ Bật" : "Tắt"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
              <button
                onClick={handleSavePolicy}
                className="px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors cursor-pointer flex items-center gap-1.5"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <Save className="w-4 h-4" /> Lưu chính sách
              </button>
              {policySaved && (
                <span className="text-green-600 flex items-center gap-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                  <CheckCircle className="w-4 h-4" /> Đã lưu thành công
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === CROSS GRADING === */}
      {activeSection === "cross_grading" && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-blue-700" style={{ fontSize: "12px" }}>
              Chấm chéo giúp tăng tính khách quan. Giảng viên A chấm bài của lớp Giảng viên B và ngược lại.
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-700 mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>Phân công Chấm chéo</h3>

            <div className="space-y-3">
              {MOCK_INSTRUCTOR_METRICS.reduce<[typeof MOCK_INSTRUCTOR_METRICS[0], typeof MOCK_INSTRUCTOR_METRICS[0]][]>((pairs, m, i, arr) => {
                if (i % 2 === 0 && i + 1 < arr.length) {
                  pairs.push([m, arr[i + 1]]);
                }
                return pairs;
              }, []).map(([a, b], i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  {/* Instructor A */}
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ fontSize: "10px", fontWeight: 700, background: "linear-gradient(145deg, #c8a84e, #a08738)" }}
                    >
                      {a.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{a.name}</p>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>{a.coursesAssigned} khóa</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <ArrowRight className="w-4 h-4 text-[#990803]" />
                    <ArrowRight className="w-4 h-4 text-[#990803] rotate-180" />
                  </div>

                  {/* Instructor B */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="min-w-0 text-right">
                      <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{b.name}</p>
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>{b.coursesAssigned} khóa</p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ fontSize: "10px", fontWeight: 700, background: "linear-gradient(145deg, #c8a84e, #a08738)" }}
                    >
                      {b.initials}
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className="px-2 py-1 rounded-lg shrink-0"
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: i === 0 ? "#22c55e" : "#f59e0b",
                      backgroundColor: i === 0 ? "#f0fdf4" : "#fefce8",
                    }}
                  >
                    {i === 0 ? "Đang thực hiện" : "Chưa bắt đầu"}
                  </span>
                </div>
              ))}
            </div>

            <button
              className="mt-3 w-full py-2 border border-dashed border-[#990803] text-[#990803] rounded-lg hover:bg-[#990803]/5 transition-colors cursor-pointer"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              + Tạo cặp chấm chéo mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}