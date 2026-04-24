import { useState } from "react";
import {
  Shield, Lock, Key, ShieldCheck, AlertTriangle, CheckCircle2,
  Fingerprint, KeyRound, Globe, FileLock2,
} from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "sonner";

/* ================================================================ */
/*  SECURITY CONFIG — SSL, SSO, 2FA, Mã hóa, Audit policy           */
/* ================================================================ */

interface ToggleRowProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  badge?: string;
  color?: string;
}

function ToggleRow({ icon: Icon, title, description, enabled, onToggle, badge, color = "#16a34a" }: ToggleRowProps) {
  return (
    <div className="p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + "15" }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p style={{ fontSize: "13px", fontWeight: 600 }}>{title}</p>
          {badge && (
            <span className="px-1.5 py-0.5 rounded bg-[#16a34a]/15 text-[#16a34a]" style={{ fontSize: "10px", fontWeight: 600 }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-muted-foreground" style={{ fontSize: "11.5px", lineHeight: 1.5 }}>{description}</p>
      </div>
      <button onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-[#16a34a]" : "bg-secondary"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          enabled ? "left-5" : "left-0.5"
        }`} />
      </button>
    </div>
  );
}

export function SecurityConfig() {
  const [ssl, setSsl] = useState(true);
  const [sso, setSso] = useState(true);
  const [twoFA, setTwoFA] = useState(true);
  const [vneidMandatory, setVneidMandatory] = useState(false);
  const [encryption, setEncryption] = useState(true);
  const [ipAllowlist, setIpAllowlist] = useState(false);
  const [auditLog, setAuditLog] = useState(true);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Shield}
        title="Cấu hình Bảo mật Hệ thống"
        subtitle="Thiết lập và quản lý rào cản bảo mật: SSL, mã hóa, SSO, 2FA và các chính sách bảo vệ quyền riêng tư."
        accentColor="#e74c3c"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={ShieldCheck} label="Điểm bảo mật" value="94/100" color="#16a34a" change="+6" trend="up" />
        <KpiCard icon={Fingerprint} label="Users đã bật 2FA" value="87%" color="#7c3aed" />
        <KpiCard icon={AlertTriangle} label="Sự cố 30 ngày" value={0} color="#16a34a" />
        <KpiCard icon={Lock} label="SSL Cert hết hạn" value="87 ngày" color="#c8a84e" subtitle="Tự động gia hạn" />
      </div>

      {/* Encryption & Transport */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>
            <Lock className="w-4 h-4 inline mr-1.5" />
            Mã hóa & Truyền tải
          </h3>
        </div>
        <div className="divide-y divide-border">
          <ToggleRow icon={Globe} title="Bắt buộc HTTPS / TLS 1.3" color="#16a34a"
            description="Tất cả traffic phải qua HTTPS. Redirect tự động HTTP → HTTPS. Dùng TLS 1.3."
            badge="Khuyến nghị" enabled={ssl} onToggle={() => { setSsl(!ssl); toast.success(`SSL/TLS ${!ssl ? "bật" : "tắt"}`); }} />
          <ToggleRow icon={FileLock2} title="Mã hóa dữ liệu tĩnh (AES-256)" color="#7c3aed"
            description="Mã hóa toàn bộ dữ liệu lưu trữ trong Data Lake bằng AES-256-GCM. Key rotate mỗi 90 ngày."
            badge="Bắt buộc" enabled={encryption} onToggle={() => { setEncryption(!encryption); toast.info(`Encryption at-rest ${!encryption ? "bật" : "tắt"}`); }} />
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>
            <KeyRound className="w-4 h-4 inline mr-1.5" />
            Xác thực & SSO
          </h3>
        </div>
        <div className="divide-y divide-border">
          <ToggleRow icon={Key} title="Single Sign-On (SAML 2.0)" color="#2563eb"
            description="Cho phép tenant cấu hình SSO riêng với IdP của họ (Azure AD, Google Workspace, Keycloak)."
            enabled={sso} onToggle={() => { setSso(!sso); toast.success(`SSO ${!sso ? "bật" : "tắt"}`); }} />
          <ToggleRow icon={Fingerprint} title="Xác thực 2 yếu tố (2FA)" color="#c8a84e"
            description="Bắt buộc 2FA cho tài khoản admin, khuyến nghị cho mọi user. Hỗ trợ TOTP + WebAuthn."
            badge="Khuyến nghị" enabled={twoFA} onToggle={() => { setTwoFA(!twoFA); toast.success(`2FA ${!twoFA ? "bật" : "tắt"}`); }} />
          <ToggleRow icon={ShieldCheck} title="Bắt buộc VNeID cho học sinh / giáo viên" color="#16a34a"
            description="Yêu cầu xác thực VNeID cho mọi tài khoản student + teacher. Đồng bộ với CSDL Quốc gia."
            enabled={vneidMandatory} onToggle={() => { setVneidMandatory(!vneidMandatory); toast.info(`VNeID mandatory ${!vneidMandatory ? "bật" : "tắt"}`); }} />
        </div>
      </div>

      {/* Network & Audit */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>
            <Shield className="w-4 h-4 inline mr-1.5" />
            Mạng & Giám sát
          </h3>
        </div>
        <div className="divide-y divide-border">
          <ToggleRow icon={Globe} title="IP Allowlist cho System Admin" color="#dc2626"
            description="Chỉ cho phép đăng nhập system_admin từ IP của văn phòng NCC. Có thể tạm bypass qua OTP."
            enabled={ipAllowlist} onToggle={() => { setIpAllowlist(!ipAllowlist); toast.warning(`IP Allowlist ${!ipAllowlist ? "bật" : "tắt"}`); }} />
          <ToggleRow icon={CheckCircle2} title="Audit Log toàn bộ hành động" color="#16a34a"
            description="Ghi log mọi thao tác (create, update, delete, login, permission change). Lưu 7 năm. Không thể xóa."
            badge="Bắt buộc" enabled={auditLog} onToggle={() => { setAuditLog(!auditLog); toast.info(`Audit log ${!auditLog ? "bật" : "tắt"}`); }} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#e74c3c]/5 to-[#16a34a]/5 rounded-xl border border-border p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600 }}>Tuân thủ quy định</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "12px", lineHeight: 1.6 }}>
            Hệ thống tuân thủ Nghị định 13/2023 về bảo vệ dữ liệu cá nhân, Luật An toàn thông tin mạng 2015
            và tích hợp VNeID theo quy định của Bộ Công an. Data center đạt chuẩn ISO 27001 & Tier 3+.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SecurityConfig;
