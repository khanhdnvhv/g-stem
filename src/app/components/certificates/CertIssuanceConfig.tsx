import { useState, useMemo } from "react";
import {
  Settings, Plus, Edit3, Trash2, ChevronRight, CheckCircle2,
  XCircle, X, Award, Eye, Copy, ToggleLeft, ToggleRight,
  AlertTriangle, ArrowRight, Zap, User, Users, Building2,
  Mail, Calendar, Hash, BookOpen, Shield, Target, FileText,
  ChevronDown, Palette, RefreshCw, Search, Filter,
} from "lucide-react";
import { MOCK_ISSUANCE_RULES } from "./cert-mock-data";
import { useConfirm } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";
import { DEFAULT_TEMPLATES, CertMiniPreview, CertificatePreviewSVG } from "./CertPreview";
import type { IssuanceRule, CertTemplate } from "./CertPreview";
import { CATEGORIES } from "../mock-data";

// ── Course list for dropdown ──
const AVAILABLE_COURSES = [
  "Kỹ năng Lãnh đạo cho Quản lý Cấp trung",
  "An toàn Lao động trong Xây dựng & Khai khoáng",
  "Tuân thủ Pháp luật Doanh nghiệp",
  "Onboarding - Chào mừng Thành viên mới",
  "Phân tích Tài chính Doanh nghiệp",
  "Marketing số & Truyền thông Thương hiệu",
  "Quản trị Rủi ro & Kiểm soát Nội bộ",
  "Quản lý Dự án BĐS & Hạ tầng",
  "Chuyển đổi số Doanh nghiệp",
  "An toàn Mỏ & Vận hành Khai thác",
  "Kỹ năng Giao tiếp & Thuyết trình",
  "Nghiệp vụ Ngân hàng Bán lẻ",
  "Phòng chống Rửa tiền (AML)",
  "Vận hành Nhà máy Điện Thăng Long",
  "ESG & Phát triển Bền vững",
  "ISO 9001:2015 - Quản lý Chất lượng",
  "Kỹ thuật Xi măng & VLXD nâng cao",
  "Quản lý Dòng tiền & Thu chi",
];

const VALIDITY_OPTIONS: { value: IssuanceRule["validity"]; label: string; desc: string }[] = [
  { value: "permanent", label: "Vĩnh viễn", desc: "Chứng chỉ không có hạn sử dụng" },
  { value: "1year", label: "1 năm", desc: "Cần gia hạn sau 12 tháng" },
  { value: "2year", label: "2 năm", desc: "Cần gia hạn sau 24 tháng" },
  { value: "custom", label: "Tùy chỉnh", desc: "Nhập số ngày cụ thể" },
];

const RENEWAL_OPTIONS: { value: IssuanceRule["renewalPolicy"]; label: string; icon: any; desc: string }[] = [
  { value: "retake_exam", label: "Thi lại", icon: Target, desc: "Thi certification lại để gia hạn" },
  { value: "retake_course", label: "Học lại", icon: BookOpen, desc: "Hoàn thành lại toàn bộ khóa" },
  { value: "auto", label: "Tự động", icon: Zap, desc: "Tự động gia hạn nếu đủ ĐK" },
  { value: "none", label: "Không", icon: XCircle, desc: "Không hỗ trợ gia hạn" },
];

const WORKFLOW_STEPS: { value: IssuanceRule["approvalWorkflow"]; label: string; steps: string[]; color: string }[] = [
  { value: "auto", label: "Tự động", steps: ["Đủ ĐK", "Cấp tự động"], color: "#22c55e" },
  { value: "instructor", label: "GV xác nhận", steps: ["Đủ ĐK", "GV xác nhận", "Cấp"], color: "#3b82f6" },
  { value: "manager", label: "Quản lý duyệt", steps: ["Đủ ĐK", "GV xác nhận", "QL duyệt", "Cấp"], color: "#f59e0b" },
  { value: "director", label: "BGĐ duyệt", steps: ["Đủ ĐK", "GV xác nhận", "QL duyệt", "BGĐ duyệt", "Cấp"], color: "#990803" },
];

const validityLabels: Record<string, string> = { permanent: "Vĩnh viễn", "1year": "1 năm", "2year": "2 năm", custom: "Tùy chỉnh" };
const workflowLabels: Record<string, string> = { auto: "Tự động", instructor: "GV xác nhận", manager: "Quản lý duyệt", director: "BGĐ duyệt" };
const renewalLabels: Record<string, string> = { retake_exam: "Thi lại", retake_course: "Học lại", auto: "Tự động", none: "Không" };

function emptyRule(): IssuanceRule {
  return {
    id: `IR-${Date.now()}`,
    courseName: "",
    category: CATEGORIES[0],
    templateId: DEFAULT_TEMPLATES[0].id,
    templateName: DEFAULT_TEMPLATES[0].name,
    conditions: { completionRequired: true, minScore: 70, certExamRequired: false, instructorApproval: false },
    validity: "1year",
    validityDays: undefined,
    renewalPolicy: "retake_exam",
    approvalWorkflow: "auto",
    codeFormat: "GXC-{CAT}-{YYYY}-{SEQ:5}",
    emailNotify: true,
    isActive: true,
  };
}

export function CertIssuanceConfig() {
  const [rules, setRules] = useState<IssuanceRule[]>(MOCK_ISSUANCE_RULES);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<IssuanceRule | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery) return rules;
    const q = searchQuery.toLowerCase();
    return rules.filter(r => r.courseName.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
  }, [rules, searchQuery]);

  const openCreate = () => { setEditingRule(emptyRule()); setShowModal(true); };
  const openEdit = (rule: IssuanceRule) => { setEditingRule({ ...rule }); setShowModal(true); };
  const closeModal = () => { setEditingRule(null); setShowModal(false); setPreviewTemplate(false); };

  const saveRule = () => {
    if (!editingRule) return;
    // Update templateName from id
    const tpl = DEFAULT_TEMPLATES.find(t => t.id === editingRule.templateId);
    const final = { ...editingRule, templateName: tpl?.name || editingRule.templateName };
    setRules(prev => {
      const idx = prev.findIndex(r => r.id === final.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = final; return copy; }
      return [...prev, final];
    });
    closeModal();
  };

  const confirm = useConfirm();
  const deleteRule = async (id: string) => {
    const rule = rules.find(r => r.id === id);
    const ok = await confirm({
      title: "Xóa quy tắc cấp chứng chỉ?",
      message: `Bạn có chắc muốn xóa quy tắc "${rule?.name || ""}"? Thao tác này không thể hoàn tác.`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setRules(prev => prev.filter(r => r.id !== id));
      import("sonner").then(m => m.toast.success("Đã xóa quy tắc cấp chứng chỉ"));
    }
  };

  const toggleActive = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const duplicateRule = (rule: IssuanceRule) => {
    const dup = { ...rule, id: `IR-${Date.now()}`, courseName: rule.courseName + " (Bản sao)", isActive: false };
    setRules(prev => [...prev, dup]);
  };

  const updateField = (field: string, value: any) => {
    if (!editingRule) return;
    setEditingRule({ ...editingRule, [field]: value });
  };

  const updateCondition = (field: string, value: any) => {
    if (!editingRule) return;
    setEditingRule({ ...editingRule, conditions: { ...editingRule.conditions, [field]: value } });
  };

  // Live code preview
  const codePreview = editingRule
    ? editingRule.codeFormat
        .replace("{YYYY}", "2026")
        .replace("{SEQ:5}", "00042")
        .replace("{CAT}", editingRule.category.slice(0, 4).toUpperCase().replace(/ /g, ""))
    : "";

  // ── MODAL ──
  if (showModal && editingRule) {
    const isNew = !MOCK_ISSUANCE_RULES.find(r => r.id === editingRule.id) && !rules.find(r => r.id === editingRule.id && r.courseName !== "");
    const selectedTemplate = DEFAULT_TEMPLATES.find(t => t.id === editingRule.templateId) || DEFAULT_TEMPLATES[0];

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={closeModal} className="p-2 hover:bg-secondary rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h2 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>
                {isNew ? "Tạo Quy tắc Cấp mới" : "Chỉnh sửa Quy tắc"}
              </h2>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Liên kết khóa học với phôi và thiết lập điều kiện cấp chứng chỉ</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={closeModal} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
            <button onClick={saveRule} className="px-5 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "13px", fontWeight: 600 }}>
              {isNew ? "Tạo quy tắc" : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Form - 2 cols */}
          <div className="lg:col-span-2 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">

            {/* 1. Course & Category */}
            <FormSection title="Khóa học & Danh mục" icon={BookOpen}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Khóa học *">
                  <select value={editingRule.courseName} onChange={e => updateField("courseName", e.target.value)}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none cursor-pointer" style={{ fontSize: "13px" }}>
                    <option value="">-- Chọn khóa học --</option>
                    {AVAILABLE_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Danh mục đào tạo">
                  <select value={editingRule.category} onChange={e => updateField("category", e.target.value)}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none cursor-pointer" style={{ fontSize: "13px" }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
              </div>
            </FormSection>

            {/* 2. Template Selection */}
            <FormSection title="Phôi Chứng chỉ" icon={Palette}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DEFAULT_TEMPLATES.map(tpl => (
                  <button key={tpl.id} onClick={() => updateField("templateId", tpl.id)}
                    className={`rounded-xl border-2 p-2.5 text-left transition-all cursor-pointer ${editingRule.templateId === tpl.id ? "border-[#990803] bg-[#990803]/3 shadow-md" : "border-border hover:border-gray-300"}`}>
                    <div className="mb-2"><CertMiniPreview template={tpl} /></div>
                    <p className="text-foreground truncate" style={{ fontSize: "11px", fontWeight: editingRule.templateId === tpl.id ? 600 : 400 }}>{tpl.name}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{tpl.usageCount} lần dùng</p>
                    {editingRule.templateId === tpl.id && (
                      <div className="mt-1 flex items-center gap-1 text-[#990803]" style={{ fontSize: "9px", fontWeight: 600 }}>
                        <CheckCircle2 className="w-3 h-3" /> Đã chọn
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button onClick={() => setPreviewTemplate(!previewTemplate)} className="mt-2 flex items-center gap-1.5 text-[#990803] hover:underline cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}>
                <Eye className="w-3.5 h-3.5" /> {previewTemplate ? "Ẩn xem trước" : "Xem trước phôi đã chọn"}
              </button>
              {previewTemplate && (
                <div className="mt-3 bg-secondary/30 rounded-xl border border-border p-4">
                  <CertificatePreviewSVG
                    template={selectedTemplate}
                    studentName="Nguyễn Văn A"
                    courseName={editingRule.courseName || "Khóa đào tạo mẫu"}
                    score={editingRule.conditions.minScore}
                    certNo={codePreview}
                  />
                </div>
              )}
            </FormSection>

            {/* 3. Conditions */}
            <FormSection title="Điều kiện Cấp Chứng chỉ" icon={Target}>
              <div className="space-y-3">
                {/* Completion */}
                <ToggleRow
                  checked={editingRule.conditions.completionRequired}
                  onChange={v => updateCondition("completionRequired", v)}
                  label="Hoàn thành 100% khóa học"
                  desc="Học viên phải hoàn thành tất cả bài học, bài tập"
                />
                {/* Min Score */}
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Điểm tối thiểu</p>
                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Điểm đạt yêu cầu để được cấp chứng chỉ</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" value={editingRule.conditions.minScore} onChange={e => updateCondition("minScore", Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-16 px-2 py-1.5 bg-input-background rounded-lg border-0 text-center focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "14px", fontWeight: 700 }} />
                      <span className="text-muted-foreground" style={{ fontSize: "12px" }}>%</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="100" value={editingRule.conditions.minScore} onChange={e => updateCondition("minScore", Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#990803]" style={{ background: `linear-gradient(to right, #990803 ${editingRule.conditions.minScore}%, #e5e7eb ${editingRule.conditions.minScore}%)` }} />
                  <div className="flex justify-between mt-1 text-muted-foreground" style={{ fontSize: "9px" }}>
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>
                {/* Cert Exam */}
                <ToggleRow
                  checked={editingRule.conditions.certExamRequired}
                  onChange={v => updateCondition("certExamRequired", v)}
                  label="Yêu cầu thi Certification"
                  desc="Bắt buộc vượt qua bài thi chứng nhận riêng"
                />
                {/* Instructor Approval */}
                <ToggleRow
                  checked={editingRule.conditions.instructorApproval}
                  onChange={v => updateCondition("instructorApproval", v)}
                  label="Giảng viên xác nhận"
                  desc="Giảng viên phải xác nhận năng lực thực tế"
                />
              </div>
            </FormSection>

            {/* 4. Validity & Renewal */}
            <FormSection title="Hiệu lực & Gia hạn" icon={Calendar}>
              <FormField label="Thời hạn hiệu lực">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {VALIDITY_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => updateField("validity", opt.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${editingRule.validity === opt.value ? "border-[#990803] bg-[#990803]/3" : "border-border hover:border-gray-300"}`}>
                      <p className="text-foreground" style={{ fontSize: "12px", fontWeight: editingRule.validity === opt.value ? 600 : 400 }}>{opt.label}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
                {editingRule.validity === "custom" && (
                  <div className="mt-3 flex items-center gap-2">
                    <input type="number" value={editingRule.validityDays || ""} onChange={e => updateField("validityDays", Number(e.target.value))}
                      placeholder="Số ngày" className="w-32 px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
                    <span className="text-muted-foreground" style={{ fontSize: "12px" }}>ngày</span>
                  </div>
                )}
              </FormField>

              <FormField label="Chính sách Gia hạn">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {RENEWAL_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button key={opt.value} onClick={() => updateField("renewalPolicy", opt.value)}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${editingRule.renewalPolicy === opt.value ? "border-[#990803] bg-[#990803]/3" : "border-border hover:border-gray-300"}`}>
                        <Icon className="w-4 h-4 mb-1.5" style={{ color: editingRule.renewalPolicy === opt.value ? "#990803" : "#9ca3af" }} />
                        <p className="text-foreground" style={{ fontSize: "12px", fontWeight: editingRule.renewalPolicy === opt.value ? 600 : 400 }}>{opt.label}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </FormField>
            </FormSection>

            {/* 5. Approval Workflow */}
            <FormSection title="Workflow Phê duy��t" icon={Users}>
              <div className="space-y-3">
                {WORKFLOW_STEPS.map(wf => {
                  const selected = editingRule.approvalWorkflow === wf.value;
                  return (
                    <button key={wf.value} onClick={() => updateField("approvalWorkflow", wf.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${selected ? "border-[#990803] bg-[#990803]/3" : "border-border hover:border-gray-300"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-foreground" style={{ fontSize: "13px", fontWeight: selected ? 600 : 400 }}>{wf.label}</p>
                        {selected && <CheckCircle2 className="w-4 h-4 text-[#990803]" />}
                      </div>
                      {/* Visual steps */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {wf.steps.map((step, si) => (
                          <div key={si} className="flex items-center gap-1.5">
                            <span className={`px-2.5 py-1 rounded-lg ${selected ? "bg-[#990803]/10 text-[#990803]" : "bg-secondary text-muted-foreground"}`}
                              style={{ fontSize: "10px", fontWeight: 500 }}>
                              {step}
                            </span>
                            {si < wf.steps.length - 1 && (
                              <ArrowRight className="w-3 h-3" style={{ color: selected ? "#990803" : "#d1d5db" }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </FormSection>

            {/* 6. Code Format & Notifications */}
            <FormSection title="Mã số & Thông báo" icon={Hash}>
              <FormField label="Format mã chứng chỉ">
                <input type="text" value={editingRule.codeFormat} onChange={e => updateField("codeFormat", e.target.value)}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none font-mono" style={{ fontSize: "13px" }} />
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Xem trước:</span>
                  <code className="px-2 py-1 bg-[#990803]/5 rounded text-[#990803]" style={{ fontSize: "12px", fontWeight: 600 }}>{codePreview}</code>
                </div>
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  {["{YYYY}", "{SEQ:5}", "{CAT}", "{MM}"].map(tag => (
                    <button key={tag} onClick={() => updateField("codeFormat", editingRule.codeFormat + tag)}
                      className="px-2 py-0.5 bg-secondary rounded text-muted-foreground hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "9px" }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </FormField>

              <ToggleRow
                checked={editingRule.emailNotify}
                onChange={v => updateField("emailNotify", v)}
                label="Gửi email thông báo"
                desc="Tự động gửi email cho học viên khi chứng chỉ được cấp"
              />

              <ToggleRow
                checked={editingRule.isActive}
                onChange={v => updateField("isActive", v)}
                label="Kích hoạt quy tắc"
                desc="Quy tắc sẽ tự động áp dụng khi học viên đạt đủ điều kiện"
              />
            </FormSection>
          </div>

          {/* Right sidebar - Summary */}
          <div className="space-y-4">
            <div className="sticky top-0 space-y-4">
              {/* Summary card */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Tóm tắt Quy tắc</h4>

                <SummaryRow icon={BookOpen} label="Khóa học" value={editingRule.courseName || "(chưa chọn)"} />
                <SummaryRow icon={FileText} label="Danh mục" value={editingRule.category} />
                <SummaryRow icon={Palette} label="Phôi" value={selectedTemplate.name} />
                <SummaryRow icon={Target} label="Điểm tối thiểu" value={`${editingRule.conditions.minScore}%`} />
                <SummaryRow icon={Calendar} label="Hiệu lực" value={validityLabels[editingRule.validity] + (editingRule.validity === "custom" && editingRule.validityDays ? ` (${editingRule.validityDays} ngày)` : "")} />
                <SummaryRow icon={RefreshCw} label="Gia hạn" value={renewalLabels[editingRule.renewalPolicy]} />
                <SummaryRow icon={Users} label="Workflow" value={workflowLabels[editingRule.approvalWorkflow]} />
                <SummaryRow icon={Hash} label="Mã mẫu" value={codePreview} mono />

                <div className="pt-2 border-t border-border space-y-1.5">
                  <p className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>Điều kiện:</p>
                  {[
                    { label: "Hoàn thành 100%", active: editingRule.conditions.completionRequired },
                    { label: `Điểm ≥ ${editingRule.conditions.minScore}%`, active: true },
                    { label: "Thi Certification", active: editingRule.conditions.certExamRequired },
                    { label: "GV xác nhận", active: editingRule.conditions.instructorApproval },
                  ].map(c => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      {c.active ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-gray-300" />}
                      <span className={c.active ? "text-foreground" : "text-muted-foreground"} style={{ fontSize: "11px" }}>{c.label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${editingRule.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="text-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>{editingRule.isActive ? "Đang kích hoạt" : "Chưa kích hoạt"}</span>
                </div>
              </div>

              {/* Mini template preview */}
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 500 }}>Phôi: {selectedTemplate.name}</p>
                <CertMiniPreview template={selectedTemplate} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN LIST ──
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-[#990803]/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#990803]/10 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-[#990803]" />
          </div>
          <div className="flex-1">
            <h3 className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>Quy tắc Cấp Chứng chỉ</h3>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>
              Liên kết khóa học với phôi chứng chỉ, thiết lập điều kiện tự động cấp, thời hạn hiệu lực và workflow phê duyệt.
              Hiện có <strong>{rules.length}</strong> quy tắc, <strong>{rules.filter(r => r.isActive).length}</strong> đang kích hoạt.
            </p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer shrink-0" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Thêm quy tắc
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên khóa học, danh mục..."
          className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
      </div>

      {/* Rule list */}
      <div className="space-y-3">
        {filtered.map(rule => {
          const expanded = expandedId === rule.id;
          return (
            <div key={rule.id} className={`bg-card rounded-xl border transition-all ${expanded ? "border-[#990803]/20 shadow-md" : "border-border hover:shadow-sm"}`}>
              <button onClick={() => setExpandedId(expanded ? null : rule.id)} className="w-full flex items-center gap-4 p-4 text-left cursor-pointer">
                <div className="relative shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${rule.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{rule.courseName}</h4>
                  <p className="text-muted-foreground truncate" style={{ fontSize: "11px" }}>{rule.category} &bull; Phôi: {rule.templateName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground" style={{ fontSize: "10px" }}>{validityLabels[rule.validity]}</span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground" style={{ fontSize: "10px" }}>{workflowLabels[rule.approvalWorkflow]}</span>
                  {rule.conditions.certExamRequired && <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-600" style={{ fontSize: "10px" }}>Thi CC</span>}
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
                </div>
              </button>

              {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {/* Conditions */}
                    <div className="space-y-2">
                      <p className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>Điều kiện cấp</p>
                      {[
                        { label: "Hoàn thành 100%", active: rule.conditions.completionRequired },
                        { label: `Điểm ≥ ${rule.conditions.minScore}%`, active: true },
                        { label: "Thi certification", active: rule.conditions.certExamRequired },
                        { label: "GV xác nhận", active: rule.conditions.instructorApproval },
                      ].map(cond => (
                        <div key={cond.label} className="flex items-center gap-2">
                          {cond.active ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-gray-300" />}
                          <span className={cond.active ? "text-foreground" : "text-muted-foreground"} style={{ fontSize: "11px" }}>{cond.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Validity */}
                    <div className="space-y-2">
                      <p className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>Hiệu lực & Gia hạn</p>
                      <p className="text-foreground" style={{ fontSize: "12px" }}>Thời hạn: <strong>{validityLabels[rule.validity]}</strong></p>
                      <p className="text-foreground" style={{ fontSize: "12px" }}>Gia hạn: <strong>{renewalLabels[rule.renewalPolicy]}</strong></p>
                      <p className="text-foreground" style={{ fontSize: "12px" }}>Email: <strong>{rule.emailNotify ? "Có" : "Không"}</strong></p>
                    </div>
                    {/* Workflow visual */}
                    <div className="space-y-2">
                      <p className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>Workflow phê duyệt</p>
                      <div className="flex flex-col gap-1">
                        {(WORKFLOW_STEPS.find(w => w.value === rule.approvalWorkflow)?.steps || []).map((step, si) => (
                          <div key={si} className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-[#990803]/10 flex items-center justify-center">
                              <span className="text-[#990803]" style={{ fontSize: "8px", fontWeight: 700 }}>{si + 1}</span>
                            </div>
                            <span className="text-foreground" style={{ fontSize: "11px" }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Code format */}
                    <div className="space-y-2">
                      <p className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>Format mã số</p>
                      <code className="block px-2 py-1 bg-secondary rounded text-[#990803]" style={{ fontSize: "11px" }}>{rule.codeFormat}</code>
                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Phôi: {rule.templateName}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                    <button onClick={() => openEdit(rule)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>
                      <Edit3 className="w-3 h-3" /> Sửa quy tắc
                    </button>
                    <button onClick={() => duplicateRule(rule)} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
                      <Copy className="w-3 h-3" /> Nhân bản
                    </button>
                    <button onClick={() => toggleActive(rule.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
                      {rule.isActive ? <ToggleRight className="w-3.5 h-3.5 text-green-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-gray-400" />}
                      {rule.isActive ? "Tắt" : "Bật"}
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => deleteRule(rule.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
                      <Trash2 className="w-3 h-3" /> Xóa
                    </button>
                  </div>


                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          variant={searchQuery ? "search" : "empty"}
          title="Không tìm thấy quy tắc nào"
          message={searchQuery ? `Không có kết quả cho "${searchQuery}"` : "Thử thay đổi từ khóa hoặc tạo quy tắc mới"}
          action={searchQuery ? { label: "Xóa bộ lọc", onClick: () => setSearchQuery("") } : undefined}
        />
      )}
    </div>
  );
}

// ── Helper Components ──
function FormSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#990803]" />
        <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{title}</h4>
      </div>
      {children}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "11px", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
      <div className="relative shrink-0">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-10 h-[22px] rounded-full transition-colors ${checked ? "bg-[#990803]" : "bg-gray-300"}`}>
          <div className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
      </div>
      <div>
        <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{label}</p>
        <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{desc}</p>
      </div>
    </label>
  );
}

function SummaryRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{label}</p>
        <p className={`text-foreground truncate ${mono ? "font-mono" : ""}`} style={{ fontSize: "11px", fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}