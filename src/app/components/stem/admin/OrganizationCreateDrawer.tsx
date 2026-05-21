import { useState, useEffect, useRef } from "react";
import { Building2, School, Package, ChevronDown, X, Loader2, Check } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/app/components/ui/sheet";
import { toast } from "@/app/lib/toast";
import { MOCK_ORGS, PROVINCES_VN } from "./org-data";

/* ================================================================ */
/*  TYPES                                                            */
/* ================================================================ */
type OrgCreateType = "so_gd" | "truong" | "ncc";

interface SoGdForm {
  ten: string; ma: string; tinhThanh: string; diaChi: string;
  lhHoTen: string; lhEmail: string; lhDienThoai: string; emailAdmin: string;
}
interface TruongForm {
  soGdChaId: string; soGdChaTen: string; soGdChaTinh: string;
  ten: string; ma: string; bacHoc: string; diaChi: string;
  lhHoTen: string; lhEmail: string; lhDienThoai: string; emailAdmin: string;
}
interface NccForm {
  ten: string; ma: string; loaiNcc: string[];
  maSoThue: string; diaChiDN: string;
  ddplHoTen: string; ddplChucVu: string;
  emailAdmin: string; ghiChuNoiBo: string;
}

const INIT_SO: SoGdForm   = { ten:"", ma:"", tinhThanh:"", diaChi:"", lhHoTen:"", lhEmail:"", lhDienThoai:"", emailAdmin:"" };
const INIT_TR: TruongForm = { soGdChaId:"", soGdChaTen:"", soGdChaTinh:"", ten:"", ma:"", bacHoc:"", diaChi:"", lhHoTen:"", lhEmail:"", lhDienThoai:"", emailAdmin:"" };
const INIT_NCC: NccForm   = { ten:"", ma:"", loaiNcc:[], maSoThue:"", diaChiDN:"", ddplHoTen:"", ddplChucVu:"", emailAdmin:"", ghiChuNoiBo:"" };

const EXISTING_CODES = new Set(MOCK_ORGS.map((o) => o.code));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(0[35789]\d{8})$/;
const CODE_RE  = /^[A-Z0-9_]+$/;
const MST_RE   = /^\d{10}(\d{3})?$/;

/* ================================================================ */
/*  HELPERS                                                          */
/* ================================================================ */
function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[12px] font-medium text-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-[11px]">{error}</p>}
      {!error && hint && <p className="text-muted-foreground text-[11px]">{hint}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full bg-background border rounded-lg px-3 py-2 text-[13px] outline-none transition-colors ${
    err ? "border-red-400 focus:border-red-500" : "border-border focus:border-[#1e40af]"
  }`;

const textareaCls = (err?: string) => inputCls(err) + " resize-none";

/* ================================================================ */
/*  SEARCHABLE SỞ GD DROPDOWN                                        */
/* ================================================================ */
const SO_GD_LIST = MOCK_ORGS.filter((o) => o.type === "so_gd" && o.status === "active");

function SoGdSelect({ value, onSelect, error }: {
  value: string; onSelect: (id: string, ten: string, tinh: string) => void; error?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = SO_GD_LIST.find((s) => s.id === value);
  const filtered = SO_GD_LIST.filter(
    (s) => !query || s.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between ${inputCls(error)} text-left`}>
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? selected.name : "Chọn Sở GD..."}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm Sở GD..." className={inputCls() + " py-1.5"} />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-center text-muted-foreground text-[12px] py-4">Không tìm thấy</p>
              : filtered.map((s) => (
                <button key={s.id} type="button"
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary text-left text-[13px] transition-colors"
                  onClick={() => { onSelect(s.id, s.name, s.province ?? ""); setOpen(false); setQuery(""); }}>
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.province} · {s.code}</p>
                  </div>
                  {s.id === value && <Check className="w-4 h-4 text-[#1e40af]" />}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  STEP 1 — CHỌN LOẠI TỔ CHỨC                                       */
/* ================================================================ */
function StepChooseType({ value, onChange }: { value: OrgCreateType | null; onChange: (t: OrgCreateType) => void }) {
  const types: { id: OrgCreateType; icon: typeof Building2; color: string; bg: string; label: string; desc: string }[] = [
    { id: "so_gd",  icon: Building2, color: "#1e40af", bg: "#dbeafe", label: "Sở GD",     desc: "Sở Giáo dục và Đào tạo cấp tỉnh/thành phố. Quản lý nhiều trường học trực thuộc." },
    { id: "truong", icon: School,    color: "#0e7490", bg: "#cffafe", label: "Trường học", desc: "Trường từ mầm non đến THPT. Phải thuộc một Sở GD đang hoạt động." },
    { id: "ncc",    icon: Package,   color: "#6d28d9", bg: "#ede9fe", label: "NCC",        desc: "Nhà cung cấp nội dung hoặc thiết bị STEM. Độc lập, không thuộc Sở nào." },
  ];
  return (
    <div className="space-y-3 pt-2">
      <p className="text-[13px] text-muted-foreground">Chọn loại tổ chức bạn muốn tạo. Mỗi loại có form nhập liệu riêng.</p>
      {types.map(({ id, icon: Icon, color, bg, label, desc }) => (
        <button key={id} type="button"
          onClick={() => onChange(id)}
          className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
            value === id
              ? "border-[color:var(--sel-color)] bg-[color:var(--sel-bg)]"
              : "border-border hover:border-border/80 hover:bg-secondary/50"
          }`}
          style={{ "--sel-color": color, "--sel-bg": bg + "60" } as React.CSSProperties}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: bg }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14px]" style={{ color: value === id ? color : undefined }}>{label}</p>
            <p className="text-muted-foreground text-[12px] mt-0.5 leading-relaxed">{desc}</p>
          </div>
          {value === id && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1"
              style={{ backgroundColor: color }}>
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

/* ================================================================ */
/*  FORM SỞ GD                                                       */
/* ================================================================ */
function FormSoGd({ data, errors, onChange, onBlurMa }: {
  data: SoGdForm; errors: Record<string, string>;
  onChange: (k: keyof SoGdForm, v: string) => void;
  onBlurMa: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tên Sở" required error={errors.ten} className="col-span-2">
          <input value={data.ten} onChange={(e) => onChange("ten", e.target.value)}
            maxLength={200} placeholder="Ví dụ: Sở GD&ĐT Hà Nội" className={inputCls(errors.ten)} />
        </Field>
        <Field label="Mã Sở" required error={errors.ma}>
          <input value={data.ma} onChange={(e) => onChange("ma", e.target.value.toUpperCase())}
            onBlur={onBlurMa} maxLength={50} placeholder="VD: SGD_HN"
            className={inputCls(errors.ma)} />
        </Field>
        <Field label="Tỉnh/thành" required error={errors.tinhThanh}>
          <select value={data.tinhThanh} onChange={(e) => onChange("tinhThanh", e.target.value)}
            className={inputCls(errors.tinhThanh) + " cursor-pointer"}>
            <option value="">Chọn tỉnh/thành...</option>
            {PROVINCES_VN.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Địa chỉ">
        <textarea value={data.diaChi} onChange={(e) => onChange("diaChi", e.target.value)}
          rows={2} placeholder="Số nhà, đường, quận/huyện..." className={textareaCls()} />
      </Field>
      <div className="border-t border-border/50 pt-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Đầu mối liên hệ</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Họ tên">
            <input value={data.lhHoTen} onChange={(e) => onChange("lhHoTen", e.target.value)}
              placeholder="Nguyễn Văn A" className={inputCls()} />
          </Field>
          <Field label="Số điện thoại" error={errors.lhDienThoai}>
            <input value={data.lhDienThoai} onChange={(e) => onChange("lhDienThoai", e.target.value)}
              placeholder="0912345678" className={inputCls(errors.lhDienThoai)} />
          </Field>
          <Field label="Email" error={errors.lhEmail} className="col-span-2">
            <input value={data.lhEmail} onChange={(e) => onChange("lhEmail", e.target.value)}
              placeholder="lienhe@so.edu.vn" className={inputCls(errors.lhEmail)} />
          </Field>
        </div>
      </div>
      <div className="border-t border-border/50 pt-4">
        <Field label="Email tài khoản Quản lý Sở đầu tiên" required error={errors.emailAdmin}
          hint="Tài khoản Quản lý Sở sẽ được tạo tự động và gửi email kích hoạt.">
          <input value={data.emailAdmin} onChange={(e) => onChange("emailAdmin", e.target.value)}
            placeholder="admin@so.edu.vn" className={inputCls(errors.emailAdmin)} />
        </Field>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  FORM TRƯỜNG HỌC                                                  */
/* ================================================================ */
function FormTruong({ data, errors, onChange, onBlurMa }: {
  data: TruongForm; errors: Record<string, string>;
  onChange: (k: keyof TruongForm, v: string | { id: string; ten: string; tinh: string }) => void;
  onBlurMa: () => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Sở GD cha" required error={errors.soGdChaId}>
        <SoGdSelect value={data.soGdChaId}
          onSelect={(id, ten, tinh) => onChange("soGdChaId", { id, ten, tinh })}
          error={errors.soGdChaId} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tên Trường" required error={errors.ten} className="col-span-2">
          <input value={data.ten} onChange={(e) => onChange("ten", e.target.value)}
            disabled={!data.soGdChaId} maxLength={200}
            placeholder={data.soGdChaId ? "Ví dụ: Trường THCS Nguyễn Trãi" : "Chọn Sở GD trước"}
            className={inputCls(errors.ten) + (!data.soGdChaId ? " opacity-50 cursor-not-allowed" : "")} />
        </Field>
        <Field label="Mã Trường" required error={errors.ma}>
          <input value={data.ma} onChange={(e) => onChange("ma", e.target.value.toUpperCase())}
            onBlur={onBlurMa} disabled={!data.soGdChaId} maxLength={50} placeholder="VD: THCS_NT"
            className={inputCls(errors.ma) + (!data.soGdChaId ? " opacity-50 cursor-not-allowed" : "")} />
        </Field>
        <Field label="Bậc học">
          <select value={data.bacHoc} onChange={(e) => onChange("bacHoc", e.target.value)}
            disabled={!data.soGdChaId}
            className={inputCls() + " cursor-pointer" + (!data.soGdChaId ? " opacity-50 cursor-not-allowed" : "")}>
            <option value="">Chọn bậc học...</option>
            {["Mẫu giáo","Tiểu học","THCS","THPT","Liên cấp","THPT Nghề"].map((b) =>
              <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Tỉnh/thành">
          <input value={data.soGdChaTinh} readOnly
            className={inputCls() + " bg-secondary cursor-not-allowed text-muted-foreground"}
            placeholder="Tự động theo Sở cha" />
        </Field>
      </div>
      <Field label="Địa chỉ">
        <textarea value={data.diaChi} onChange={(e) => onChange("diaChi", e.target.value)}
          disabled={!data.soGdChaId} rows={2}
          className={textareaCls() + (!data.soGdChaId ? " opacity-50 cursor-not-allowed" : "")} />
      </Field>
      <div className="border-t border-border/50 pt-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Đầu mối liên hệ</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Họ tên">
            <input value={data.lhHoTen} onChange={(e) => onChange("lhHoTen", e.target.value)}
              disabled={!data.soGdChaId} placeholder="Nguyễn Thị B"
              className={inputCls() + (!data.soGdChaId ? " opacity-50 cursor-not-allowed" : "")} />
          </Field>
          <Field label="Số điện thoại" error={errors.lhDienThoai}>
            <input value={data.lhDienThoai} onChange={(e) => onChange("lhDienThoai", e.target.value)}
              disabled={!data.soGdChaId} placeholder="0912345678"
              className={inputCls(errors.lhDienThoai) + (!data.soGdChaId ? " opacity-50 cursor-not-allowed" : "")} />
          </Field>
          <Field label="Email" error={errors.lhEmail} className="col-span-2">
            <input value={data.lhEmail} onChange={(e) => onChange("lhEmail", e.target.value)}
              disabled={!data.soGdChaId} placeholder="lienhe@truong.edu.vn"
              className={inputCls(errors.lhEmail) + (!data.soGdChaId ? " opacity-50 cursor-not-allowed" : "")} />
          </Field>
        </div>
      </div>
      <div className="border-t border-border/50 pt-4">
        <Field label="Email tài khoản Quản lý Trường đầu tiên" required error={errors.emailAdmin}
          hint="Tài khoản Hiệu trưởng/Quản lý Trường sẽ được tạo tự động và gửi email kích hoạt.">
          <input value={data.emailAdmin} onChange={(e) => onChange("emailAdmin", e.target.value)}
            disabled={!data.soGdChaId} placeholder="hieupho@truong.edu.vn"
            className={inputCls(errors.emailAdmin) + (!data.soGdChaId ? " opacity-50 cursor-not-allowed" : "")} />
        </Field>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  FORM NCC                                                         */
/* ================================================================ */
const NCC_LOAI = [
  { id: "noi_dung", label: "Nội dung" },
  { id: "thiet_bi", label: "Thiết bị" },
  { id: "ca_hai",   label: "Cả hai" },
];

function FormNcc({ data, errors, onChange, onBlurMa }: {
  data: NccForm; errors: Record<string, string>;
  onChange: (k: keyof NccForm, v: string | string[]) => void;
  onBlurMa: () => void;
}) {
  const toggleLoai = (id: string) => {
    const cur = data.loaiNcc;
    onChange("loaiNcc", cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tên NCC" required error={errors.ten} className="col-span-2">
          <input value={data.ten} onChange={(e) => onChange("ten", e.target.value)}
            maxLength={200} placeholder="Công ty CP Giáo dục XYZ" className={inputCls(errors.ten)} />
        </Field>
        <Field label="Mã NCC" required error={errors.ma}>
          <input value={data.ma} onChange={(e) => onChange("ma", e.target.value.toUpperCase())}
            onBlur={onBlurMa} maxLength={50} placeholder="VD: CPGD_XYZ" className={inputCls(errors.ma)} />
        </Field>
        <Field label="Mã số thuế" error={errors.maSoThue}>
          <input value={data.maSoThue} onChange={(e) => onChange("maSoThue", e.target.value)}
            placeholder="0123456789" className={inputCls(errors.maSoThue)} />
        </Field>
      </div>
      <Field label="Loại NCC" required error={errors.loaiNcc}>
        <div className="flex gap-2 flex-wrap pt-1">
          {NCC_LOAI.map(({ id, label }) => (
            <button key={id} type="button"
              onClick={() => toggleLoai(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
                data.loaiNcc.includes(id)
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-card border-border hover:bg-secondary text-foreground"
              }`}>
              {data.loaiNcc.includes(id) && <Check className="w-3 h-3" />}
              {label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Địa chỉ doanh nghiệp">
        <textarea value={data.diaChiDN} onChange={(e) => onChange("diaChiDN", e.target.value)}
          rows={2} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" className={textareaCls()} />
      </Field>
      <div className="border-t border-border/50 pt-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Người đại diện pháp lý</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Họ tên">
            <input value={data.ddplHoTen} onChange={(e) => onChange("ddplHoTen", e.target.value)}
              placeholder="Nguyễn Văn C" className={inputCls()} />
          </Field>
          <Field label="Chức vụ">
            <input value={data.ddplChucVu} onChange={(e) => onChange("ddplChucVu", e.target.value)}
              placeholder="Tổng Giám đốc" className={inputCls()} />
          </Field>
        </div>
      </div>
      <div className="border-t border-border/50 pt-4">
        <Field label="Email tài khoản Admin NCC đầu tiên" required error={errors.emailAdmin}
          hint="Tài khoản Admin NCC sẽ được tạo và gửi email kích hoạt.">
          <input value={data.emailAdmin} onChange={(e) => onChange("emailAdmin", e.target.value)}
            placeholder="admin@ncc.com" className={inputCls(errors.emailAdmin)} />
        </Field>
      </div>
      <div className="border-t border-border/50 pt-4">
        <Field label="Ghi chú nội bộ">
          <textarea value={data.ghiChuNoiBo} onChange={(e) => onChange("ghiChuNoiBo", e.target.value)}
            rows={3} placeholder="Ghi chú chỉ dành cho quản trị viên hệ thống (NCC sẽ không thấy)"
            className={textareaCls()} />
        </Field>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  MAIN DRAWER                                                      */
/* ================================================================ */
interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

export function OrganizationCreateDrawer({ open, onClose, onSuccess }: Props) {
  const [step, setStep]         = useState<1 | 2>(1);
  const [orgType, setOrgType]   = useState<OrgCreateType | null>(null);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [saving, setSaving]     = useState(false);
  const [checkingMa, setCheckingMa] = useState(false);

  const [soData, setSoData]   = useState<SoGdForm>(INIT_SO);
  const [trData, setTrData]   = useState<TruongForm>(INIT_TR);
  const [nccData, setNccData] = useState<NccForm>(INIT_NCC);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setStep(1); setOrgType(null); setErrors({});
      setSoData(INIT_SO); setTrData(INIT_TR); setNccData(INIT_NCC);
    }
  }, [open]);

  /* ---- helpers ---- */
  const clearErr = (key: string) => setErrors((p) => { const n = { ...p }; delete n[key]; return n; });

  const checkCode = (code: string): string | null => {
    if (!code) return "Mã là bắt buộc";
    if (!CODE_RE.test(code)) return "Chỉ dùng chữ hoa, số và dấu gạch dưới";
    if (EXISTING_CODES.has(code)) return "Mã này đã tồn tại trong hệ thống";
    return null;
  };

  /* ---- blur ma handlers ---- */
  const handleBlurMa = (code: string) => {
    setCheckingMa(true);
    setTimeout(() => {
      setCheckingMa(false);
      const err = checkCode(code);
      if (err) setErrors((p) => ({ ...p, ma: err }));
      else clearErr("ma");
    }, 400);
  };

  /* ---- validate ---- */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (orgType === "so_gd") {
      if (!soData.ten.trim())       errs.ten = "Bắt buộc";
      const maErr = checkCode(soData.ma); if (maErr) errs.ma = maErr;
      if (!soData.tinhThanh)        errs.tinhThanh = "Bắt buộc";
      if (soData.lhEmail && !EMAIL_RE.test(soData.lhEmail)) errs.lhEmail = "Email không hợp lệ";
      if (soData.lhDienThoai && !PHONE_RE.test(soData.lhDienThoai)) errs.lhDienThoai = "SĐT không hợp lệ (VD: 0912345678)";
      if (!soData.emailAdmin.trim()) errs.emailAdmin = "Bắt buộc";
      else if (!EMAIL_RE.test(soData.emailAdmin)) errs.emailAdmin = "Email không hợp lệ";
    } else if (orgType === "truong") {
      if (!trData.soGdChaId)        errs.soGdChaId = "Bắt buộc — chọn Sở GD cha";
      if (!trData.ten.trim())       errs.ten = "Bắt buộc";
      const maErr = checkCode(trData.ma); if (maErr) errs.ma = maErr;
      if (trData.lhEmail && !EMAIL_RE.test(trData.lhEmail)) errs.lhEmail = "Email không hợp lệ";
      if (trData.lhDienThoai && !PHONE_RE.test(trData.lhDienThoai)) errs.lhDienThoai = "SĐT không hợp lệ";
      if (!trData.emailAdmin.trim()) errs.emailAdmin = "Bắt buộc";
      else if (!EMAIL_RE.test(trData.emailAdmin)) errs.emailAdmin = "Email không hợp lệ";
    } else if (orgType === "ncc") {
      if (!nccData.ten.trim())      errs.ten = "Bắt buộc";
      const maErr = checkCode(nccData.ma); if (maErr) errs.ma = maErr;
      if (!nccData.loaiNcc.length)  errs.loaiNcc = "Chọn ít nhất một loại";
      if (nccData.maSoThue && !MST_RE.test(nccData.maSoThue)) errs.maSoThue = "MST phải có 10 hoặc 13 chữ số";
      if (!nccData.emailAdmin.trim()) errs.emailAdmin = "Bắt buộc";
      else if (!EMAIL_RE.test(nccData.emailAdmin)) errs.emailAdmin = "Email không hợp lệ";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ---- submit ---- */
  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSuccess();
      onClose();
      const name = orgType === "so_gd" ? soData.ten : orgType === "truong" ? trData.ten : nccData.ten;
      toast.success(`Đã tạo tổ chức "${name}" thành công`);
    }, 900);
  };

  const TYPE_LABELS: Record<OrgCreateType, string> = { so_gd: "Sở GD", truong: "Trường học", ncc: "NCC" };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v && !saving) onClose(); }}>
      <SheetContent
        side="right"
        className="flex flex-col p-0 gap-0 overflow-hidden"
        style={{ width: "min(560px, 95vw)", maxWidth: "none" }}>

        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 shrink-0">
              {([1, 2] as const).map((s) => (
                <div key={s} className={`flex items-center justify-center rounded-full transition-all ${
                  s < step ? "w-5 h-5 bg-[#1e40af]" :
                  s === step ? "w-6 h-6 bg-[#1e40af] text-white font-semibold shadow-sm" :
                  "w-5 h-5 bg-secondary text-muted-foreground"
                }`} style={{ fontSize: "11px" }}>
                  {s < step ? <Check className="w-3 h-3 text-white" /> : s}
                </div>
              ))}
            </div>
            <div>
              <SheetTitle className="text-[15px]">
                {step === 1 ? "Thêm tổ chức mới" : `Tạo ${orgType ? TYPE_LABELS[orgType] : ""}`}
              </SheetTitle>
              <SheetDescription className="text-[12px]">
                {step === 1 ? "Bước 1 / 2 — Chọn loại tổ chức" : `Bước 2 / 2 — Nhập thông tin`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 1 && (
            <StepChooseType value={orgType} onChange={(t) => { setOrgType(t); setErrors({}); }} />
          )}
          {step === 2 && orgType === "so_gd" && (
            <FormSoGd data={soData} errors={errors}
              onChange={(k, v) => { setSoData((p) => ({ ...p, [k]: v })); clearErr(k); }}
              onBlurMa={() => handleBlurMa(soData.ma)} />
          )}
          {step === 2 && orgType === "truong" && (
            <FormTruong data={trData} errors={errors}
              onChange={(k, v) => {
                if (typeof v === "object") {
                  setTrData((p) => ({ ...p, soGdChaId: v.id, soGdChaTen: v.ten, soGdChaTinh: v.tinh }));
                  clearErr("soGdChaId");
                } else {
                  setTrData((p) => ({ ...p, [k]: v }));
                  clearErr(k as string);
                }
              }}
              onBlurMa={() => handleBlurMa(trData.ma)} />
          )}
          {step === 2 && orgType === "ncc" && (
            <FormNcc data={nccData} errors={errors}
              onChange={(k, v) => { setNccData((p) => ({ ...p, [k]: v })); clearErr(k); }}
              onBlurMa={() => handleBlurMa(nccData.ma)} />
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-border flex items-center justify-between gap-2 bg-card">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-[13px] transition-colors disabled:opacity-50">
            Huỷ
          </button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button type="button" onClick={() => { setStep(1); setErrors({}); }} disabled={saving}
                className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-[13px] transition-colors disabled:opacity-50">
                ← Quay lại
              </button>
            )}
            {step === 1 ? (
              <button type="button" onClick={() => setStep(2)} disabled={!orgType}
                className="px-5 py-2 bg-[#1e40af] text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-medium transition-opacity">
                Tiếp tục →
              </button>
            ) : (
              <button type="button" onClick={handleSave} disabled={saving || checkingMa}
                className="flex items-center gap-2 px-5 py-2 bg-[#1e40af] text-white rounded-lg hover:opacity-90 disabled:opacity-60 text-[13px] font-medium transition-opacity">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : "Lưu tổ chức"}
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
