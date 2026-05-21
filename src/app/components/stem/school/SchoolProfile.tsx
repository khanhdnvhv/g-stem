import { Link, useNavigate } from "react-router";
import {
  Building2, MapPin, Phone, Mail, Users, GraduationCap,
  Calendar, Award, Edit2, CheckCircle, Package, Star, Layers, ShoppingBag,
} from "lucide-react";
import { schoolProfileData } from "../../mock-data/index";
import type { SchoolProfileData } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";

/* ================================================================ */
/*  SCHOOL PROFILE — hồ sơ trường học cho Hiệu trưởng               */
/* ================================================================ */

const TYPE_LABELS: Record<SchoolProfileData["type"], string> = {
  public: "Công lập",
  private: "Tư thục",
  "semi-public": "Bán công",
};

const LEVEL_LABELS: Record<SchoolProfileData["level"], string> = {
  elementary: "Tiểu học",
  middle: "Trung học Cơ sở",
  high: "Trung học Phổ thông",
  multi: "Nhiều cấp",
};

function PackageTierChip({ tier }: { tier: SchoolProfileData["packageTier"] }) {
  const meta = {
    advanced: { label: "Nâng cao", color: "#c8a84e" },
    basic: { label: "Cơ bản", color: "#2563eb" },
    minimum: { label: "Tối thiểu", color: "#94a3b8" },
  }[tier];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold"
      style={{ fontSize: "12px", color: meta.color, backgroundColor: meta.color + "18" }}
    >
      <Package className="w-3 h-3" />
      {meta.label}
    </span>
  );
}

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="flex items-center gap-2 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
        <Icon className="w-4 h-4 text-[#2563eb]" />
        {title}
      </h2>
      {children}
    </div>
  );
}

export function SchoolProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tenantId = user?.tenantType === "school" ? user.tenantId : "";
  const profile = (() => {
    try {
      const stored = localStorage.getItem(`gstem_school_profile_${tenantId}`);
      if (stored) return { ...schoolProfileData, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return schoolProfileData;
  })();

  const licensePercent = Math.round((profile.licenseUsed / profile.licenseQuota) * 100);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <PageHeader
        icon={Building2}
        title="Hồ sơ Trường học"
        subtitle={`${profile.shortName} · ${profile.province}`}
        accentColor="#990803"
        actions={
          <>
            <Link
              to="/school/purchase"
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500, textDecoration: "none", color: "inherit" }}
            >
              <ShoppingBag className="w-4 h-4" />
              Mua sắm gói STEM
            </Link>
            <button
              onClick={() => navigate("/school/settings")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </button>
          </>
        }
      />

      {/* ── Hero Banner ── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          {/* Logo placeholder */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shrink-0 select-none"
            style={{
              fontSize: "22px", fontWeight: 800,
              background: "linear-gradient(145deg, #990803, #7a0602)",
            }}
          >
            {profile.shortName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-foreground" style={{ fontSize: "20px", fontWeight: 800 }}>
              {profile.officialName}
            </h1>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "13px" }}>
              Mã MOET: <span className="font-mono font-semibold">{profile.moetCode}</span>
              {" · "}Thành lập năm {profile.foundedYear}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Accreditation */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#16a34a]/10 text-[#16a34a]" style={{ fontSize: "11px", fontWeight: 600 }}>
                <CheckCircle className="w-3.5 h-3.5" />
                {profile.accreditation}
              </span>
              {/* Type chip */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                {TYPE_LABELS[profile.type]}
              </span>
              {/* Level chip */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2563eb]/10 text-[#2563eb]" style={{ fontSize: "11px", fontWeight: 600 }}>
                <Layers className="w-3 h-3" />
                {LEVEL_LABELS[profile.level]} (Lớp {profile.gradeRange})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main 3-col Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left col-span-2 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Thông tin cơ bản */}
          <SectionCard title="Thông tin cơ bản" icon={MapPin}>
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-muted-foreground">Địa chỉ</dt>
                <dd className="text-sm font-semibold text-foreground flex items-start gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#2563eb]" />
                  {profile.address}, {profile.ward}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Quận / Huyện</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">{profile.district}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tỉnh / Thành phố</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">{profile.province}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Điện thoại</dt>
                <dd className="text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-[#2563eb]" />
                  {profile.principalPhone}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Email Hiệu trưởng</dt>
                <dd className="text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-[#2563eb]" />
                  {profile.principalEmail}
                </dd>
              </div>
            </dl>
          </SectionCard>

          {/* Ban Giám hiệu & STEM */}
          <SectionCard title="Ban Giám hiệu & STEM" icon={GraduationCap}>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Hiệu trưởng</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{profile.principalName}</p>
                </div>
                <div className="text-right">
                  <a href={`tel:${profile.principalPhone}`} className="flex items-center gap-1 text-muted-foreground hover:text-[#990803]" style={{ fontSize: "12px" }}>
                    <Phone className="w-3.5 h-3.5" />
                    {profile.principalPhone}
                  </a>
                  <a href={`mailto:${profile.principalEmail}`} className="flex items-center gap-1 text-muted-foreground hover:text-[#990803] mt-0.5" style={{ fontSize: "12px" }}>
                    <Mail className="w-3.5 h-3.5" />
                    {profile.principalEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Phó Hiệu trưởng</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{profile.deputyPrincipalName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs text-muted-foreground">Điều phối viên STEM</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{profile.stemCoordinatorName}</p>
                </div>
                <a href={`tel:${profile.stemCoordinatorPhone}`} className="flex items-center gap-1 text-muted-foreground hover:text-[#990803]" style={{ fontSize: "12px" }}>
                  <Phone className="w-3.5 h-3.5" />
                  {profile.stemCoordinatorPhone}
                </a>
              </div>
            </div>
          </SectionCard>

          {/* Hợp đồng STEM */}
          <SectionCard title="Hợp đồng STEM" icon={Calendar}>
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-muted-foreground">Ngày bắt đầu</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">
                  {new Date(profile.contractStartDate).toLocaleDateString("vi-VN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Ngày kết thúc</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">
                  {new Date(profile.contractEndDate).toLocaleDateString("vi-VN")}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground mb-1">Gói triển khai</dt>
                <dd><PackageTierChip tier={profile.packageTier} /></dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground mb-1.5">
                  Sử dụng License: <span className="font-semibold text-foreground">{profile.licenseUsed.toLocaleString("vi-VN")}</span>
                  <span className="mx-1">/</span>
                  <span className="font-semibold text-foreground">{profile.licenseQuota.toLocaleString("vi-VN")}</span>
                  <span className="ml-1">({licensePercent}%)</span>
                </dt>
                <dd>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${licensePercent}%`,
                        background: licensePercent >= 90
                          ? "#dc2626"
                          : licensePercent >= 70
                          ? "#f59e0b"
                          : "#2563eb",
                      }}
                    />
                  </div>
                </dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* KPI 2x2 grid */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={Users} label="Học sinh" value={profile.studentCount.toLocaleString("vi-VN")} color="#2563eb" />
            <KpiCard icon={GraduationCap} label="Giáo viên" value={profile.teacherCount} color="#7c3aed" />
            <KpiCard icon={Layers} label="Lớp học" value={profile.classCount} color="#0891b2" />
            <KpiCard icon={Package} label="Phòng STEM" value={profile.stemClassroomCount} color="#c8a84e" />
          </div>

          {/* Thành tích nổi bật */}
          <SectionCard title="Thành tích nổi bật" icon={Award}>
            <ul className="space-y-2">
              {profile.achievements.map((ach, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Star className="w-3.5 h-3.5 text-[#c8a84e] shrink-0 mt-0.5" />
                  <span className="text-foreground" style={{ fontSize: "12.5px" }}>{ach}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Cấp học */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 700 }}>
              <Layers className="w-4 h-4 text-[#2563eb]" />
              Cấp học
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2563eb]/10 text-[#2563eb]" style={{ fontSize: "12px", fontWeight: 600 }}>
                {LEVEL_LABELS[profile.level]}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-secondary text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
                Lớp {profile.gradeRange}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Suppress unused warning for user */}
      {user && null}
    </div>
  );
}

export default SchoolProfile;
