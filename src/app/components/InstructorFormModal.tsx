import { useState, useEffect } from "react";
import { X, Plus, GraduationCap, Award, Tag, Check } from "lucide-react";
import { SUBSIDIARIES, DEPARTMENTS } from "./mock-data";

// ─── Types ───
export interface InstructorFormData {
  id: string;
  name: string;
  email: string;
  phone: string;
  subsidiary: string;
  department: string;
  title: string;
  specializations: string[];
  bio: string;
  certifications: string[];
  status: "active" | "on-leave" | "inactive" | "pending";
  availability: "available" | "busy" | "unavailable";
}

interface InstructorFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InstructorFormData) => void;
  editData?: InstructorFormData | null;
}

const STATUSES: { value: InstructorFormData["status"]; label: string; color: string; bg: string }[] = [
  { value: "active", label: "Hoạt động", color: "#16a34a", bg: "bg-green-50 border-green-300 text-green-700" },
  { value: "pending", label: "Chờ duyệt", color: "#c8a84e", bg: "bg-yellow-50 border-yellow-300 text-yellow-700" },
  { value: "on-leave", label: "Nghỉ phép", color: "#ea580c", bg: "bg-orange-50 border-orange-300 text-orange-700" },
  { value: "inactive", label: "Ngừng", color: "#6b7280", bg: "bg-gray-50 border-gray-300 text-gray-600" },
];

const AVAILABILITIES: { value: InstructorFormData["availability"]; label: string; emoji: string }[] = [
  { value: "available", label: "Sẵn sàng", emoji: "🟢" },
  { value: "busy", label: "Bận", emoji: "🟡" },
  { value: "unavailable", label: "Không khả dụng", emoji: "🔴" },
];

const emptyForm: InstructorFormData = {
  id: "",
  name: "",
  email: "",
  phone: "",
  subsidiary: "",
  department: "",
  title: "",
  specializations: [],
  bio: "",
  certifications: [],
  status: "pending",
  availability: "available",
};

export function InstructorFormModal({ open, onClose, onSubmit, editData }: InstructorFormModalProps) {
  const isEdit = !!editData;
  const [form, setForm] = useState<InstructorFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1 | 2>(1);
  const [specInput, setSpecInput] = useState("");
  const [certInput, setCertInput] = useState("");

  useEffect(() => {
    if (open && editData) {
      setForm({ ...editData });
    } else if (open) {
      setForm({ ...emptyForm, id: `INS${String(Date.now()).slice(-4)}` });
    }
  }, [open, editData]);

  if (!open) return null;

  const set = (field: keyof InstructorFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const addSpec = () => {
    const t = specInput.trim();
    if (t && !form.specializations.includes(t)) {
      set("specializations", [...form.specializations, t]);
      setSpecInput("");
    }
  };

  const addCert = () => {
    const t = certInput.trim();
    if (t && !form.certifications.includes(t)) {
      set("certifications", [...form.certifications, t]);
      setCertInput("");
    }
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!form.email.trim()) e.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.phone.trim()) e.phone = "Vui lòng nhập SĐT";
    if (!form.subsidiary) e.subsidiary = "Vui lòng chọn đơn vị";
    if (!form.department) e.department = "Vui lòng chọn phòng ban";
    if (!form.title.trim()) e.title = "Vui lòng nhập chức danh";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (form.specializations.length === 0) e.specializations = "Cần ít nhất 1 chuyên môn";
    if (!form.bio.trim()) e.bio = "Vui lòng nhập mô tả";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = () => {
    if (!validateStep2()) return;
    onSubmit(form);
    handleClose();
  };

  const handleClose = () => {
    setForm(emptyForm);
    setStep(1);
    setErrors({});
    setSpecInput("");
    setCertInput("");
    onClose();
  };

  const inputCls = (field: string) =>
    `w-full px-3 py-2.5 bg-input-background rounded-lg border ${errors[field] ? "border-red-400 ring-2 ring-red-100" : "border-border"} focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none transition-colors`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-[#990803]/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#990803]/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#990803]" />
            </div>
            <div>
              <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>
                {isEdit ? "Chỉnh sửa giảng viên" : "Thêm giảng viên mới"}
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                Bước {step}/2 — {step === 1 ? "Thông tin cá nhân" : "Chuyên môn & Cài đặt"}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        <div className="h-1 bg-secondary">
          <div className="h-full bg-[#990803] transition-all duration-300" style={{ width: step === 1 ? "50%" : "100%" }} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {step === 1 ? (
            <>
              {/* Name */}
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="VD: Nguyễn Văn An" className={inputCls("name")} style={{ fontSize: "13px" }} />
                {errors.name && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.name}</p>}
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder="ten@geleximco.vn" className={inputCls("email")} style={{ fontSize: "13px" }} />
                  {errors.email && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                    placeholder="0912-xxx-xxx" className={inputCls("phone")} style={{ fontSize: "13px" }} />
                  {errors.phone && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.phone}</p>}
                </div>
              </div>

              {/* Subsidiary + Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Đơn vị <span className="text-red-500">*</span>
                  </label>
                  <select value={form.subsidiary} onChange={e => set("subsidiary", e.target.value)}
                    className={inputCls("subsidiary")} style={{ fontSize: "13px" }}>
                    <option value="">— Chọn đơn vị —</option>
                    {SUBSIDIARIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.subsidiary && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.subsidiary}</p>}
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Phòng ban <span className="text-red-500">*</span>
                  </label>
                  <select value={form.department} onChange={e => set("department", e.target.value)}
                    className={inputCls("department")} style={{ fontSize: "13px" }}>
                    <option value="">— Chọn phòng ban —</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.department}</p>}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Chức danh <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
                  placeholder="VD: Trưởng phòng IT, Senior Manager..." className={inputCls("title")} style={{ fontSize: "13px" }} />
                {errors.title && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.title}</p>}
              </div>
            </>
          ) : (
            <>
              {/* Specializations */}
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Chuyên môn giảng dạy <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input type="text" value={specInput}
                    onChange={e => setSpecInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSpec(); } }}
                    placeholder="VD: Leadership, Excel, Data Science..."
                    className="flex-1 px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none"
                    style={{ fontSize: "13px" }} />
                  <button type="button" onClick={addSpec} className="px-3 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {errors.specializations && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.specializations}</p>}
                {form.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.specializations.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#990803]/5 text-[#990803] rounded-lg" style={{ fontSize: "12px", fontWeight: 500 }}>
                        <Tag className="w-3 h-3" /> {s}
                        <button onClick={() => set("specializations", form.specializations.filter(x => x !== s))} className="ml-0.5 hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Chứng chỉ chuyên môn
                </label>
                <div className="flex gap-2">
                  <input type="text" value={certInput}
                    onChange={e => setCertInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCert(); } }}
                    placeholder="VD: PMP, CFA, AWS Certified..."
                    className="flex-1 px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none"
                    style={{ fontSize: "13px" }} />
                  <button type="button" onClick={addCert} className="px-3 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.certifications.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#c8a84e]/10 text-[#c8a84e] rounded-lg" style={{ fontSize: "12px", fontWeight: 500 }}>
                        <Award className="w-3 h-3" /> {c}
                        <button onClick={() => set("certifications", form.certifications.filter(x => x !== c))} className="ml-0.5 hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Giới thiệu bản thân <span className="text-red-500">*</span>
                </label>
                <textarea value={form.bio} onChange={e => set("bio", e.target.value)}
                  placeholder="Tóm tắt kinh nghiệm và thế mạnh giảng dạy..."
                  rows={3} className={inputCls("bio")} style={{ fontSize: "13px", resize: "vertical" }} />
                {errors.bio && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.bio}</p>}
              </div>

              {/* Status + Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Trạng thái</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STATUSES.map(s => (
                      <button key={s.value} type="button" onClick={() => set("status", s.value)}
                        className={`py-2 rounded-lg border transition-colors cursor-pointer ${form.status === s.value ? s.bg : "bg-input-background border-border text-muted-foreground hover:border-[#990803]/30"}`}
                        style={{ fontSize: "12px", fontWeight: 500 }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Khả dụng</label>
                  <div className="space-y-1.5">
                    {AVAILABILITIES.map(a => (
                      <button key={a.value} type="button" onClick={() => set("availability", a.value)}
                        className={`w-full py-2 rounded-lg border transition-colors cursor-pointer text-left px-3 ${form.availability === a.value ? "bg-[#990803]/5 border-[#990803]/30 text-[#990803]" : "bg-input-background border-border text-muted-foreground hover:border-[#990803]/30"}`}
                        style={{ fontSize: "12px", fontWeight: 500 }}>
                        {a.emoji} {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/30">
          <div>
            {step === 2 && (
              <button type="button" onClick={() => { setStep(1); setErrors({}); }}
                className="px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                ← Quay lại
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleClose}
              className="px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              Hủy
            </button>
            {step === 1 ? (
              <button type="button" onClick={handleNext}
                className="px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                Tiếp theo →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit}
                className="px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors flex items-center gap-2 cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                {isEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isEdit ? "Lưu thay đổi" : "Thêm giảng viên"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
