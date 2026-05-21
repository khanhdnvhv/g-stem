import { useState, useEffect, useRef, useCallback } from "react";
import { X, Check, Search, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/app/lib/toast";
import type { OrgType } from "./org-data";
import { MOCK_ORGS } from "./org-data";
import type { Account } from "./account-data";
import { ROLE_DISPLAY } from "./account-data";
import type { StemRole } from "../../AuthContext";

/* ================================================================ */
/*  CONFIG                                                          */
/* ================================================================ */
const ROLE_ORDER: StemRole[] = [
  "student", "teacher",
  "school_principal", "school_admin", "school_itadmin",
  "authority_admin", "authority_viewer",
  "supplier_admin", "supplier_content", "supplier_sales", "supplier_warranty",
  "system_admin",
];

function orgTypeForRole(role: StemRole): OrgType | null {
  if (["student", "teacher", "school_principal", "school_admin", "school_itadmin"].includes(role)) return "truong";
  if (["supplier_admin", "supplier_content", "supplier_sales", "supplier_warranty"].includes(role)) return "ncc";
  if (["authority_admin", "authority_viewer"].includes(role)) return "so_gd";
  return null;
}

function codeLabel(role: StemRole): string | null {
  if (role === "student") return "Mã học sinh";
  if (role === "teacher") return "Mã giáo viên";
  return null;
}

const VN_PHONE = /^(0[35789]\d{8})$/;

/* ================================================================ */
/*  SEARCHABLE ORG SELECT                                           */
/* ================================================================ */
function OrgSelectField({ orgType, value, onChange }: {
  orgType: OrgType; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const orgs = MOCK_ORGS.filter((o) => o.type === orgType);
  const filtered = orgs.filter((o) =>
    !query || o.name.toLowerCase().includes(query.toLowerCase()) || o.code.toLowerCase().includes(query.toLowerCase())
  );
  const selected = orgs.find((o) => o.id === value);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const TYPE_LABEL: Record<OrgType, string> = { so_gd: "Sở GD", truong: "Trường", ncc: "NCC" };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => { setOpen((v) => !v); setQuery(""); }}
        className="flex items-center justify-between w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-[13px] outline-none hover:border-foreground/30 transition-colors text-left">
        {selected
          ? <span className="truncate font-medium">{selected.name}</span>
          : <span className="text-muted-foreground">Chọn {TYPE_LABEL[orgType]}...</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 w-full bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-[12px] outline-none focus:border-[#1e40af]" />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.map((o) => (
              <button key={o.id} type="button" onClick={() => { onChange(o.id); setOpen(false); }}
                className={`w-full px-3 py-2.5 text-left hover:bg-secondary flex items-center justify-between text-[12.5px] transition-colors ${value === o.id ? "bg-blue-50" : ""}`}>
                <div>
                  <p className="font-medium">{o.name}</p>
                  <p className="text-muted-foreground text-[11px] font-mono">{o.code}{o.province ? ` · ${o.province}` : ""}</p>
                </div>
                {value === o.id && <Check className="w-3.5 h-3.5 text-[#1e40af] shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-center text-muted-foreground text-[12px] py-4">Không tìm thấy</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  FORM STATE                                                      */
/* ================================================================ */
interface FormState {
  role:        StemRole | "";
  orgId:       string;
  name:        string;
  email:       string;
  phone:       string;
  code:        string;
  note:        string;
}

const EMPTY: FormState = { role: "", orgId: "", name: "", email: "", phone: "", code: "", note: "" };

interface FormErrors {
  role?:  string;
  orgId?: string;
  name?:  string;
  email?: string;
  phone?: string;
}

/* ================================================================ */
/*  DRAWER                                                          */
/* ================================================================ */
interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (account: Account) => void;
}

export function AccountCreateDrawer({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailUnique, setEmailUnique] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset khi mở
  useEffect(() => {
    if (open) { setForm(EMPTY); setErrors({}); setEmailUnique(null); }
  }, [open]);

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Email unique check (mock API)
  const checkEmail = useCallback((email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setEmailChecking(true);
    setEmailUnique(null);
    if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    emailTimerRef.current = setTimeout(() => {
      const existing = ["khang@geleximco-stem.vn", "nvhung@sogdhn.edu.vn"];
      setEmailUnique(!existing.includes(email.toLowerCase()));
      setEmailChecking(false);
    }, 800);
  }, []);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.role)  e.role  = "Vui lòng chọn vai trò";
    if (!form.orgId && orgType) e.orgId = "Vui lòng chọn tổ chức";
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!form.email)       e.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email không hợp lệ";
    else if (emailUnique === false) e.email = "Email đã được sử dụng";
    if (form.phone && !VN_PHONE.test(form.phone)) e.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      const newAccount: Account = {
        id:         `ACC-${Date.now()}`,
        code:       form.code || `NEW-${Date.now().toString().slice(-5)}`,
        name:       form.name.trim(),
        email:      form.email.toLowerCase().trim(),
        phone:      form.phone || undefined,
        role:       form.role as StemRole,
        orgId:      form.orgId,
        status:     "pending",
        lastLogin:  null,
        createdAt:  new Date().toISOString(),
        roleAssignedAt: new Date().toISOString(),
        roleAssignedBy: "khang@geleximco-stem.vn",
        manualNote: form.note || undefined,
      };
      onCreated(newAccount);
      toast.success("Tạo tài khoản thành công — Email kích hoạt đã được gửi");
      setSubmitting(false);
      onClose();
    }, 900);
  };

  const orgType = form.role ? orgTypeForRole(form.role as StemRole) : null;
  const codeLbl = form.role ? codeLabel(form.role as StemRole) : null;

  const fieldCls = "w-full bg-background border rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-colors";
  const fieldOk  = fieldCls + " border-border focus:border-[#1e40af]";
  const fieldErr = fieldCls + " border-red-400 focus:border-red-500";

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-card border-l border-border shadow-2xl"
        style={{ width: "480px" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-semibold text-[15px]">Thêm tài khoản mới</h2>
            <p className="text-muted-foreground text-[12px]">Tạo thủ công — hệ thống sẽ gửi email kích hoạt</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* 1. VAI TRÒ */}
          <div>
            <label className="block text-[12px] font-semibold text-foreground mb-1.5">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select value={form.role}
              onChange={(e) => { set("role", e.target.value); set("orgId", ""); }}
              className={`${errors.role ? fieldErr : fieldOk} cursor-pointer appearance-none`}>
              <option value="">— Chọn vai trò —</option>
              {ROLE_ORDER.map((r) => {
                const d = ROLE_DISPLAY[r];
                return <option key={r} value={r}>{d.label} ({d.group})</option>;
              })}
            </select>
            {errors.role && <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.role}</p>}
            {form.role && (
              <div className="mt-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ color: ROLE_DISPLAY[form.role as StemRole].color, backgroundColor: ROLE_DISPLAY[form.role as StemRole].bg }}>
                  {ROLE_DISPLAY[form.role as StemRole].label}
                </span>
              </div>
            )}
          </div>

          {/* Fields only show after role is selected */}
          {form.role && (
            <>
              {/* 2. TỔ CHỨC */}
              {orgType && (
                <div>
                  <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                    Tổ chức <span className="text-red-500">*</span>
                  </label>
                  <OrgSelectField orgType={orgType} value={form.orgId} onChange={(v) => set("orgId", v)} />
                  {errors.orgId && <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.orgId}</p>}
                </div>
              )}

              {/* 3. HỌ TÊN */}
              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className={errors.name ? fieldErr : fieldOk} />
                {errors.name && <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>

              {/* 4. EMAIL */}
              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input value={form.email}
                    onChange={(e) => { set("email", e.target.value); setEmailUnique(null); }}
                    onBlur={(e) => checkEmail(e.target.value)}
                    placeholder="example@truong.edu.vn"
                    className={(errors.email || emailUnique === false ? fieldErr : fieldOk) + " pr-8"} />
                  {emailChecking && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground animate-spin" />
                  )}
                  {!emailChecking && emailUnique === true && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-600" />
                  )}
                  {!emailChecking && emailUnique === false && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-500" />
                  )}
                </div>
                {errors.email && <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                {!errors.email && emailUnique === false && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Email đã được sử dụng bởi tài khoản khác</p>
                )}
                {!errors.email && emailUnique === true && (
                  <p className="text-green-600 text-[11px] mt-1 flex items-center gap-1"><Check className="w-3 h-3" />Email hợp lệ</p>
                )}
              </div>

              {/* 5. SỐ ĐIỆN THOẠI */}
              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                  Số điện thoại
                </label>
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  placeholder="0912345678"
                  className={errors.phone ? fieldErr : fieldOk} />
                {errors.phone && <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                <p className="text-muted-foreground text-[11px] mt-0.5">Định dạng Việt Nam: 03x, 05x, 07x, 08x, 09x</p>
              </div>

              {/* 6. MÃ ĐỊNH DANH (nếu có) */}
              {codeLbl && (
                <div>
                  <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                    {codeLbl}
                  </label>
                  <input value={form.code} onChange={(e) => set("code", e.target.value)}
                    placeholder={form.role === "student" ? "HS-001" : "GV-001"}
                    className={fieldOk} />
                  <p className="text-muted-foreground text-[11px] mt-0.5">Không bắt buộc — để trống hệ thống sẽ tự sinh</p>
                </div>
              )}

              {/* 7. GHI CHÚ */}
              <div>
                <label className="block text-[12px] font-semibold text-foreground mb-1.5">
                  Ghi chú tạo thủ công
                </label>
                <textarea value={form.note} onChange={(e) => set("note", e.target.value)}
                  rows={3} placeholder="Lý do tạo thủ công thay vì đồng bộ từ K12/VnEdu..."
                  className={fieldOk + " resize-none"} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border shrink-0 flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-secondary hover:bg-secondary/70 rounded-xl transition-colors font-medium text-[13px]">
            Huỷ
          </button>
          <button onClick={handleSubmit} disabled={submitting || !form.role}
            className="flex-1 px-4 py-2.5 bg-[#1e40af] text-white hover:opacity-90 disabled:opacity-40 rounded-xl transition-opacity font-medium text-[13px] flex items-center justify-center gap-2">
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </div>
      </div>
    </>
  );
}
