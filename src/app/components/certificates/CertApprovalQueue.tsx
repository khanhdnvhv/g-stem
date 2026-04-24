import { useState, useMemo } from "react";
import {
  Clock, CheckCircle2, XCircle, Search, Eye, X,
  ArrowLeft, Award, Building2, Target, Calendar, Hash,
  BookOpen, User, GraduationCap, Download, Printer,
  Share2, Mail, AlertTriangle, Filter, ChevronDown,
  MessageSquare, ArrowUpRight, Shield, History, Send,
  MoreVertical, Zap,
} from "lucide-react";
import { MOCK_APPROVALS, MOCK_CERT_RECORDS } from "./cert-mock-data";
import { DEFAULT_TEMPLATES, CertificatePreviewSVG, STATUS_CONFIG } from "./CertPreview";
import type { CertApproval } from "./CertPreview";
import { SUBSIDIARIES } from "../mock-data";
import { useAuth } from "../AuthContext";

// Simulated approval history
const APPROVAL_HISTORY_MAP: Record<string, { step: string; actor: string; action: string; time: string; comment?: string }[]> = {
  PA01: [
    { step: "Hoàn thành khóa", actor: "Hệ thống", action: "auto", time: "08/03/2026 14:22" },
    { step: "Đạt điểm thi CC", actor: "Hệ thống", action: "auto", time: "08/03/2026 15:00" },
    { step: "GV xác nhận", actor: "Hoàng Thị Lan", action: "approved", time: "09/03/2026 09:15", comment: "Học viên nắm vững kiến thức thực tế" },
    { step: "Chờ Admin duyệt", actor: "", action: "pending", time: "" },
  ],
  PA02: [
    { step: "Hoàn thành khóa", actor: "Hệ thống", action: "auto", time: "07/03/2026 10:30" },
    { step: "Đạt điểm thi CC", actor: "Hệ thống", action: "auto", time: "07/03/2026 11:15" },
    { step: "GV xác nhận", actor: "", action: "pending", time: "" },
  ],
};

export function CertApprovalQueue() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [detailApproval, setDetailApproval] = useState<CertApproval | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [subsidiaryFilter, setSubsidiaryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const isAdmin = role === "admin";

  const filtered = useMemo(() => {
    return approvals.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || a.studentName.toLowerCase().includes(q) || a.courseName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const matchSub = subsidiaryFilter === "all" || a.subsidiary === subsidiaryFilter;
      return matchSearch && matchStatus && matchSub;
    });
  }, [approvals, searchQuery, statusFilter, subsidiaryFilter]);

  const pending = approvals.filter(a => a.status === "pending");
  const approved = approvals.filter(a => a.status === "approved");
  const rejected = approvals.filter(a => a.status === "rejected");

  const approve = (id: string, commentText?: string) => {
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, status: "approved" as const } : a
    ));
    if (detailApproval?.id === id) setDetailApproval(null);
    setComment("");
  };

  const reject = (id: string, reason: string) => {
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, status: "rejected" as const, rejectionReason: reason || "Không đủ điều kiện" } : a
    ));
    setShowRejectModal(null);
    setRejectReason("");
    if (detailApproval?.id === id) setDetailApproval(null);
  };

  const bulkApprove = () => {
    const ids = selectedIds.size > 0
      ? Array.from(selectedIds)
      : pending.map(a => a.id);
    setApprovals(prev => prev.map(a =>
      ids.includes(a.id) && a.status === "pending" ? { ...a, status: "approved" as const } : a
    ));
    setSelectedIds(new Set());
    setConfirmBulk(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  // ── DETAIL MODAL ──
  if (detailApproval) {
    const template = DEFAULT_TEMPLATES.find(t => t.id === "T1") || DEFAULT_TEMPLATES[0];
    const allMet = detailApproval.conditions.every(c => c.met);
    const history = APPROVAL_HISTORY_MAP[detailApproval.id] || [
      { step: "Hoàn thành khóa", actor: "Hệ thống", action: "auto", time: detailApproval.completedAt },
      { step: "Yêu cầu cấp CC", actor: "Hệ thống", action: "auto", time: detailApproval.requestedAt },
      ...(detailApproval.instructorApproved === true ? [{ step: "GV xác nhận", actor: detailApproval.instructorName, action: "approved" as const, time: detailApproval.requestedAt }] : []),
      { step: isAdmin ? "Chờ Admin duyệt" : "Chờ xác nhận", actor: "", action: "pending" as const, time: "" },
    ];

    const isPending = detailApproval.status === "pending";
    const statusColor = detailApproval.status === "approved" ? "#22c55e" : detailApproval.status === "rejected" ? "#ef4444" : "#f59e0b";

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => { setDetailApproval(null); setComment(""); }} className="p-2 hover:bg-secondary rounded-xl transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>Phê duyệt Chứng chỉ</h2>
              <span className="px-2.5 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: statusColor, background: `${statusColor}15` }}>
                {detailApproval.status === "approved" ? "Đã duyệt" : detailApproval.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
              </span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{detailApproval.studentName} &bull; {detailApproval.courseName}</p>
          </div>
          {isPending && (
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setShowRejectModal(detailApproval.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
                <XCircle className="w-3.5 h-3.5 inline mr-1.5" />Từ chối
              </button>
              <button onClick={() => approve(detailApproval.id, comment)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />Phê duyệt
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Certificate Preview - 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-secondary/30 rounded-2xl border border-border p-6">
              <p className="text-muted-foreground mb-3" style={{ fontSize: "11px", fontWeight: 600 }}>Xem trước chứng chỉ sẽ được cấp</p>
              <CertificatePreviewSVG
                template={template}
                studentName={detailApproval.studentName}
                courseName={detailApproval.courseName}
                score={detailApproval.score}
                issuedDate={new Date().toLocaleDateString("vi-VN")}
                expiryDate={new Date(Date.now() + 365 * 86400000).toLocaleDateString("vi-VN")}
                certNo={`GXC-2026-XXXXX`}
              />
            </div>

            {/* Comment box for Admin */}
            {isPending && (
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Ghi chú phê duyệt</span>
                  <span className="text-muted-foreground" style={{ fontSize: "10px" }}>(không bắt buộc)</span>
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Nhập ghi chú nếu cần..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none resize-none"
                  style={{ fontSize: "13px" }}
                />
              </div>
            )}
          </div>

          {/* Info Panel - 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            {/* Student Info */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h4 className="text-foreground flex items-center gap-2" style={{ fontSize: "13px", fontWeight: 600 }}>
                <User className="w-4 h-4 text-[#990803]" /> Thông tin Học viên
              </h4>
              {[
                { icon: GraduationCap, label: "Họ tên", value: detailApproval.studentName },
                { icon: Building2, label: "Đơn vị", value: detailApproval.subsidiary.length > 28 ? detailApproval.subsidiary.slice(0, 28) + "..." : detailApproval.subsidiary },
                { icon: BookOpen, label: "Phòng ban", value: detailApproval.department },
                { icon: Target, label: "Điểm đạt", value: `${detailApproval.score}% (Yêu cầu: 70%)` },
                { icon: Calendar, label: "Hoàn thành", value: new Date(detailApproval.completedAt).toLocaleDateString("vi-VN") },
                { icon: Calendar, label: "Yêu cầu cấp", value: new Date(detailApproval.requestedAt).toLocaleDateString("vi-VN") },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.label}</p>
                    <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Conditions Checklist */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="text-foreground flex items-center gap-2 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Target className="w-4 h-4 text-[#990803]" /> Điều kiện Cấp
              </h4>
              <div className="space-y-2">
                {detailApproval.conditions.map((cond, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${cond.met ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
                    {cond.met
                      ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                    <span className={cond.met ? "text-green-800" : "text-red-700"} style={{ fontSize: "12px", fontWeight: 500 }}>{cond.label}</span>
                  </div>
                ))}
                {/* GV status */}
                <div className={`flex items-center gap-3 p-2.5 rounded-lg ${detailApproval.instructorApproved === true ? "bg-green-50 border border-green-100" : detailApproval.instructorApproved === false ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"}`}>
                  {detailApproval.instructorApproved === true
                    ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    : detailApproval.instructorApproved === false
                    ? <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    : <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                  <div className="min-w-0">
                    <span className={detailApproval.instructorApproved === true ? "text-green-800" : detailApproval.instructorApproved === false ? "text-red-700" : "text-amber-700"}
                      style={{ fontSize: "12px", fontWeight: 500 }}>
                      GV xác nhận: {detailApproval.instructorApproved === true ? detailApproval.instructorName : detailApproval.instructorApproved === false ? "Từ chối" : "Chờ xác nhận"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall status */}
              <div className={`mt-3 p-3 rounded-lg text-center ${allMet && detailApproval.instructorApproved === true ? "bg-green-100 border border-green-200" : "bg-amber-100 border border-amber-200"}`}>
                {allMet && detailApproval.instructorApproved === true
                  ? <p className="text-green-800" style={{ fontSize: "12px", fontWeight: 600 }}>Đã đủ tất cả điều kiện</p>
                  : <p className="text-amber-800" style={{ fontSize: "12px", fontWeight: 600 }}>Chưa đủ điều kiện ({detailApproval.conditions.filter(c => !c.met).length + (detailApproval.instructorApproved !== true ? 1 : 0)} chưa đạt)</p>}
              </div>
            </div>

            {/* Approval Timeline */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="text-foreground flex items-center gap-2 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                <History className="w-4 h-4 text-[#990803]" /> Tiến trình Phê duyệt
              </h4>
              <div className="relative pl-6">
                <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-border" />
                <div className="space-y-3">
                  {history.map((h, i) => {
                    const isLast = i === history.length - 1;
                    const actionColor = h.action === "approved" ? "#22c55e" : h.action === "rejected" ? "#ef4444" : h.action === "auto" ? "#3b82f6" : "#f59e0b";
                    return (
                      <div key={i} className="relative">
                        <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full z-10 flex items-center justify-center"
                          style={{ background: h.action === "pending" ? "#f59e0b20" : `${actionColor}20`, border: `2px solid ${actionColor}` }}>
                          {h.action === "auto" && <Zap className="w-2 h-2" style={{ color: actionColor }} />}
                          {h.action === "approved" && <CheckCircle2 className="w-2 h-2" style={{ color: actionColor }} />}
                          {h.action === "rejected" && <XCircle className="w-2 h-2" style={{ color: actionColor }} />}
                          {h.action === "pending" && <Clock className="w-2 h-2" style={{ color: actionColor }} />}
                        </div>
                        <div className={`rounded-lg p-2.5 ${isLast && h.action === "pending" ? "bg-amber-50 border border-amber-100" : "bg-secondary/30"}`}>
                          <p className="text-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>{h.step}</p>
                          {h.actor && <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{h.actor}</p>}
                          {h.time && <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{h.time}</p>}
                          {h.comment && (
                            <p className="mt-1 text-foreground italic bg-white rounded px-2 py-1" style={{ fontSize: "10px" }}>"{h.comment}"</p>
                          )}
                          {isLast && h.action === "pending" && isPending && (
                            <p className="mt-1 text-amber-700" style={{ fontSize: "10px", fontWeight: 600 }}>Đang chờ bạn xử lý</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick actions if rejected/approved */}
            {detailApproval.status !== "pending" && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Thao tác</h4>
                {detailApproval.status === "approved" && (
                  <>
                    <ActionButton icon={Download} label="Tải chứng chỉ PDF" color="#3b82f6" />
                    <ActionButton icon={Mail} label="Gửi email cho học viên" color="#8b5cf6" />
                    <ActionButton icon={Send} label="Gửi cho quản lý trực tiếp" color="#22c55e" />
                  </>
                )}
                {detailApproval.status === "rejected" && (
                  <>
                    {detailApproval.rejectionReason && (
                      <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-red-600" style={{ fontSize: "10px", fontWeight: 600 }}>Lý do từ chối:</p>
                        <p className="text-red-700" style={{ fontSize: "11px" }}>{detailApproval.rejectionReason}</p>
                      </div>
                    )}
                    <ActionButton icon={Mail} label="Gửi thông báo cho học viên" color="#f59e0b" />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowRejectModal(null)}>
            <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>Từ chối Chứng chỉ</h3>
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{detailApproval.studentName} - {detailApproval.courseName}</p>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "11px", fontWeight: 500 }}>Lý do từ chối *</label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-red-500/20 focus:outline-none resize-none"
                  style={{ fontSize: "13px" }}
                />
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {["Chưa đủ điều kiện hoàn thành", "Điểm chưa đạt yêu cầu", "Cần bổ sung bài tập thực hành", "GV chưa xác nhận năng lực"].map(reason => (
                    <button key={reason} onClick={() => setRejectReason(reason)}
                      className="px-2 py-1 bg-secondary rounded text-muted-foreground hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "10px" }}>
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowRejectModal(null)} className="flex-1 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
                <button onClick={() => reject(showRejectModal, rejectReason)} disabled={!rejectReason.trim()} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ fontSize: "13px", fontWeight: 600 }}>
                  Xác nhận Từ chối
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── MAIN LIST ──
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
          className={`bg-card rounded-xl border p-4 flex items-center gap-3 transition-all hover:shadow-md cursor-pointer text-left ${statusFilter === "pending" ? "border-amber-300 shadow-sm" : "border-border"}`}>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{pending.length}</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Chờ duyệt</p>
          </div>
          {pending.length > 0 && (
            <span className="flex h-2.5 w-2.5 ml-auto">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          )}
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "approved" ? "all" : "approved")}
          className={`bg-card rounded-xl border p-4 flex items-center gap-3 transition-all hover:shadow-md cursor-pointer text-left ${statusFilter === "approved" ? "border-green-300 shadow-sm" : "border-border"}`}>
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{approved.length}</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Đã duyệt</p>
          </div>
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "rejected" ? "all" : "rejected")}
          className={`bg-card rounded-xl border p-4 flex items-center gap-3 transition-all hover:shadow-md cursor-pointer text-left ${statusFilter === "rejected" ? "border-red-300 shadow-sm" : "border-border"}`}>
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{rejected.length}</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Từ chối</p>
          </div>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-xl border border-border p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, khóa học..."
              className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={subsidiaryFilter} onChange={e => setSubsidiaryFilter(e.target.value)}
              className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer max-w-[180px]" style={{ fontSize: "12px" }}>
              <option value="all">Đơn vị</option>
              {SUBSIDIARIES.map(s => <option key={s} value={s}>{s.length > 25 ? s.slice(0, 25) + "..." : s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {pending.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setConfirmBulk(true)} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt tất cả ({selectedIds.size > 0 ? selectedIds.size : pending.length})
          </button>
          {selectedIds.size > 0 && (
            <button onClick={() => setSelectedIds(new Set())} className="flex items-center gap-1 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
              <X className="w-3 h-3" /> Bỏ chọn ({selectedIds.size})
            </button>
          )}
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
            {filtered.length} kết quả {statusFilter !== "all" ? `(${statusFilter === "pending" ? "chờ duyệt" : statusFilter === "approved" ? "đã duyệt" : "từ chối"})` : ""}
          </span>
        </div>
      )}

      {/* Bulk confirm dialog */}
      {confirmBulk && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="text-green-800" style={{ fontSize: "13px", fontWeight: 600 }}>
              Duyệt {selectedIds.size > 0 ? selectedIds.size : pending.length} chứng chỉ?
            </p>
            <p className="text-green-600" style={{ fontSize: "11px" }}>Tất cả chứng chỉ đang chờ sẽ được phê duyệt và gửi cho học viên</p>
          </div>
          <button onClick={bulkApprove} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>Xác nhận</button>
          <button onClick={() => setConfirmBulk(false)} className="px-4 py-2 bg-white text-green-600 rounded-lg border border-green-200 hover:bg-green-50 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>Hủy</button>
        </div>
      )}

      {/* Approval List */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border/50">
        {filtered.map(app => {
          const statusColor = app.status === "approved" ? "#22c55e" : app.status === "rejected" ? "#ef4444" : "#f59e0b";
          const allCondMet = app.conditions.every(c => c.met);
          const isPending = app.status === "pending";
          return (
            <div key={app.id} className="p-4 hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setDetailApproval(app)}>
              <div className="flex items-start gap-3">
                {/* Checkbox for pending items */}
                {isPending && (
                  <input type="checkbox" checked={selectedIds.has(app.id)}
                    onChange={() => toggleSelect(app.id)}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 rounded accent-[#990803] cursor-pointer shrink-0 mt-1" />
                )}
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center shrink-0 text-white" style={{ fontSize: "11px", fontWeight: 700 }}>
                  {app.studentName.split(" ").slice(-1)[0][0]}{app.studentName.split(" ").slice(-2, -1)[0]?.[0] || ""}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{app.studentName}</h4>
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: statusColor, background: `${statusColor}15` }}>
                      {app.status === "approved" ? "Đã duyệt" : app.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                    </span>
                    {!allCondMet && isPending && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-500" style={{ fontSize: "9px", fontWeight: 500 }}>
                        <AlertTriangle className="w-2.5 h-2.5" /> Thiếu ĐK
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate" style={{ fontSize: "11px" }}>{app.courseName}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap" style={{ fontSize: "10px" }}>
                    <span className="text-muted-foreground">{app.subsidiary.length > 20 ? app.subsidiary.slice(0, 20) + "..." : app.subsidiary}</span>
                    <span className="text-muted-foreground">&bull;</span>
                    <span className="text-muted-foreground">{app.department}</span>
                    <span className="text-muted-foreground">&bull;</span>
                    <span className="text-[#990803]" style={{ fontWeight: 600 }}>{app.score}%</span>
                    <span className="text-muted-foreground">&bull;</span>
                    <span className="text-muted-foreground">{new Date(app.requestedAt).toLocaleDateString("vi-VN")}</span>
                  </div>

                  {/* Conditions mini */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {app.conditions.map((cond, ci) => (
                      <span key={ci} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 500, background: cond.met ? "#22c55e10" : "#ef444410", color: cond.met ? "#22c55e" : "#ef4444" }}>
                        {cond.met ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                        {cond.label}
                      </span>
                    ))}
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 500, background: app.instructorApproved === true ? "#22c55e10" : "#f59e0b10", color: app.instructorApproved === true ? "#22c55e" : "#f59e0b" }}>
                      {app.instructorApproved === true ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                      GV: {app.instructorApproved === true ? "OK" : "Chờ"}
                    </span>
                  </div>
                </div>

                {/* Row-level actions */}
                <div className="flex flex-col gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setDetailApproval(app)} className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer" title="Xem chi tiết">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {isPending && (
                    <>
                      <button onClick={() => approve(app.id)} className="p-2 hover:bg-green-50 rounded-lg transition-colors cursor-pointer" title="Duyệt nhanh">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </button>
                      <button onClick={() => { setDetailApproval(app); setShowRejectModal(app.id); }} className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Từ chối">
                        <XCircle className="w-4 h-4 text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Award className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="mt-3 text-foreground" style={{ fontSize: "15px", fontWeight: 500 }}>Không có yêu cầu phê duyệt</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>Tất cả chứng chỉ đã được xử lý</p>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <button onClick={() => { import("sonner").then(m => m.toast.success(label)); }} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer text-left" style={{ fontSize: "12px" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span className="text-foreground" style={{ fontWeight: 500 }}>{label}</span>
    </button>
  );
}