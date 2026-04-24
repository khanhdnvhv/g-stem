import { useState } from "react";
import {
  Server, Check, ArrowRight, ArrowLeft, CheckCircle2,
  Building2, KeyRound, User, Mail, Phone, MapPin,
} from "lucide-react";
import type { TenantType } from "../../mock-data/index";
import { tenantTypeLabelsMap } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { TenantBadge } from "../ui/badges";
import { toast } from "sonner";

/* ================================================================ */
/*  TENANT ONBOARDING WIZARD — 4 bước khởi tạo tenant mới           */
/* ================================================================ */

const STEPS = [
  { id: 1, label: "Loại & Thông tin",  icon: Building2 },
  { id: 2, label: "Quota License",     icon: KeyRound },
  { id: 3, label: "Admin User",        icon: User },
  { id: 4, label: "Xác nhận",          icon: CheckCircle2 },
];

export function TenantOnboarding() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<TenantType>("school");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [province, setProvince] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseQuota, setLicenseQuota] = useState(500);
  const [storageQuotaGB, setStorageQuotaGB] = useState(50);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const canNext =
    (step === 1 && !!name && !!code) ||
    (step === 2 && licenseQuota > 0) ||
    (step === 3 && !!adminEmail) ||
    step === 4;

  const handleSubmit = () => {
    toast.success(`Đã khởi tạo tenant "${name}" thành công. Email kích hoạt đã gửi đến ${adminEmail}.`);
    setStep(1); setName(""); setCode(""); setAdminEmail(""); setAdminName("");
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        icon={Server}
        title="Onboarding Tenant mới"
        subtitle="Wizard 4 bước khởi tạo không gian làm việc độc lập cho đối tác (Đại lý, Trường, Sở/Bộ)."
        accentColor="#e74c3c"
      />

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = step === s.id;
          const done = step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                done ? "bg-[#16a34a] text-white"
                : active ? "bg-[#e74c3c] text-white shadow-lg"
                : "bg-secondary text-muted-foreground"
              }`}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`hidden sm:inline ${active ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                style={{ fontSize: "12.5px" }}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${done ? "bg-[#16a34a]" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border p-5 min-h-[420px]">
        {step === 1 && (
          <>
            <h2 className="mb-4" style={{ fontSize: "16px", fontWeight: 700 }}>
              Bước 1: Loại tenant & Thông tin cơ bản
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>LOẠI TENANT</label>
                <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(["distributor", "school", "authority", "supplier"] as TenantType[]).map((t) => {
                    const meta = tenantTypeLabelsMap[t];
                    return (
                      <button key={t} onClick={() => setType(t)}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-1.5 transition-all ${
                          type === t ? "border-[#e74c3c] bg-[#e74c3c]/5" : "border-border hover:bg-secondary"
                        }`}>
                        <TenantBadge type={t} size="md" />
                        <span style={{ fontSize: "11px", fontWeight: 600 }}>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>TÊN TENANT *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Trường THCS Cát Linh, Đại lý ABC..."
                    className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
                    style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>MÃ TENANT *</label>
                  <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="VD: THCS-CL, DL-XYZ"
                    className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none font-mono"
                    style={{ fontSize: "12.5px" }} />
                </div>
                <div>
                  <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>TỈNH/THÀNH</label>
                  <input value={province} onChange={(e) => setProvince(e.target.value)}
                    placeholder="Hà Nội, TP.HCM..."
                    className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
                    style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>EMAIL TỔ CHỨC</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@tenant.vn"
                    className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
                    style={{ fontSize: "13px" }} />
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="mb-4" style={{ fontSize: "16px", fontWeight: 700 }}>
              Bước 2: Cấu hình Quota License & Storage
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/40 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>License seat</span>
                  <span className="text-[#e74c3c]" style={{ fontSize: "18px", fontWeight: 700 }}>{licenseQuota.toLocaleString()}</span>
                </div>
                <input type="range" min={50} max={5000} step={50} value={licenseQuota}
                  onChange={(e) => setLicenseQuota(Number(e.target.value))}
                  className="w-full accent-[#e74c3c]" />
                <div className="flex justify-between text-muted-foreground mt-1" style={{ fontSize: "10.5px" }}>
                  <span>50</span>
                  <span>5.000</span>
                </div>
              </div>

              <div className="p-4 bg-secondary/40 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>Storage quota</span>
                  <span className="text-[#7c3aed]" style={{ fontSize: "18px", fontWeight: 700 }}>{storageQuotaGB} GB</span>
                </div>
                <input type="range" min={5} max={500} step={5} value={storageQuotaGB}
                  onChange={(e) => setStorageQuotaGB(Number(e.target.value))}
                  className="w-full accent-[#7c3aed]" />
                <div className="flex justify-between text-muted-foreground mt-1" style={{ fontSize: "10.5px" }}>
                  <span>5 GB</span>
                  <span>500 GB</span>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-br from-[#c8a84e]/10 to-[#990803]/5 border border-border rounded-lg">
                <p style={{ fontSize: "12px" }}>
                  <strong>Ước tính:</strong> License seat = {licenseQuota.toLocaleString()} ×{" "}
                  {type === "school" ? "100.000" : type === "distributor" ? "500.000" : type === "authority" ? "0" : "200.000"}đ/năm ={" "}
                  <strong className="text-[#990803]">
                    {(licenseQuota * (type === "school" ? 100_000 : type === "distributor" ? 500_000 : type === "authority" ? 0 : 200_000)).toLocaleString()}đ/năm
                  </strong>
                </p>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="mb-4" style={{ fontSize: "16px", fontWeight: 700 }}>
              Bước 3: Khởi tạo tài khoản Admin cho tenant
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>HỌ TÊN ADMIN *</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={adminName} onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-9 pr-3 py-2 bg-input-background border border-border rounded-lg outline-none"
                    style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>EMAIL ADMIN *</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@tenant.vn"
                    className="w-full pl-9 pr-3 py-2 bg-input-background border border-border rounded-lg outline-none"
                    style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>SỐ ĐIỆN THOẠI</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full pl-9 pr-3 py-2 bg-input-background border border-border rounded-lg outline-none"
                    style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div className="mt-4 p-3 bg-[#2563eb]/5 border border-[#2563eb]/30 rounded-lg">
                <p style={{ fontSize: "11.5px" }}>
                  <strong>Lưu ý:</strong> Hệ thống sẽ gửi email kích hoạt kèm link đặt mật khẩu + password tạm thời
                  đến email admin. Admin này có toàn quyền quản trị không gian tenant.
                </p>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#16a34a]/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#16a34a]" />
              </div>
              <h2 className="mt-3" style={{ fontSize: "18px", fontWeight: 700 }}>Xác nhận khởi tạo tenant</h2>
              <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
                Kiểm tra thông tin lần cuối trước khi khởi tạo.
              </p>
            </div>
            <div className="mt-5 space-y-2 max-w-md mx-auto">
              <Row icon={<Building2 className="w-4 h-4" />} label="Tên" value={name} />
              <Row icon={<span className="font-mono">#</span>} label="Mã" value={code} />
              <Row icon={<TenantBadge type={type} size="xs" />} label="Loại" value={tenantTypeLabelsMap[type].label} />
              <Row icon={<MapPin className="w-4 h-4" />} label="Địa bàn" value={province || "—"} />
              <Row icon={<KeyRound className="w-4 h-4" />} label="License" value={`${licenseQuota.toLocaleString()} seat`} />
              <Row icon={<Server className="w-4 h-4" />} label="Storage" value={`${storageQuotaGB} GB`} />
              <Row icon={<User className="w-4 h-4" />} label="Admin" value={adminName || "—"} />
              <Row icon={<Mail className="w-4 h-4" />} label="Email" value={adminEmail} />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button disabled={step === 1} onClick={() => setStep(Math.max(1, step - 1))}
          className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg bg-card hover:bg-secondary disabled:opacity-40"
          style={{ fontSize: "13px", fontWeight: 500 }}>
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        {step < 4 ? (
          <button disabled={!canNext} onClick={() => setStep(step + 1)}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#e74c3c] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            Tiếp theo <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#16a34a] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Check className="w-4 h-4" /> Khởi tạo tenant
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2.5 bg-secondary/40 rounded-md">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground flex-1" style={{ fontSize: "12px" }}>{label}</span>
      <span className="text-foreground" style={{ fontSize: "12.5px", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default TenantOnboarding;
