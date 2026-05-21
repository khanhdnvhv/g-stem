import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag, Star, CheckCircle2, X, ChevronRight,
  Boxes, Package, Cpu, Users, Clock, QrCode, Building2,
  CreditCard, Landmark, Check, Zap, Shield,
  Award, GraduationCap, BookOpen, Wrench, ArrowRight,
} from "lucide-react";
import { STEM_TIERS, tenantsByType, FUNDING_SOURCES } from "../../mock-data/index";
import type { StemPackage, SchoolCourse } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { TierBadge, ProgramBadge } from "../ui/badges";
import { formatVND } from "../ui/format";

/* ================================================================ */
/*  SCHOOL PURCHASE — Landing page + popup 2-panel                  */
/* ================================================================ */

/* ── Mở rộng 18 gói mẫu ─────────────────────────────────────── */
type ExtPackage = StemPackage & { highlight?: string; features: string[]; discount?: number };

const EXTENDED: ExtPackage[] = [
  /* ── Tối thiểu (6) ── */
  {
    id: "pk-min-1", tier: "minimum", supplierTenantId: "sup-gelx",
    name: "STEM Khởi đầu — CT1 Toán học",
    description: "Bộ phòng STEM chuẩn tối thiểu CT1, phù hợp trường THCS mới triển khai.",
    priceVND: 120_000_000, thumbnails: [],
    supportedPrograms: ["CT1"], supportedGrades: [6,7,8,9],
    highlight: "Phổ biến nhất",
    features: ["15 bộ kit Toán học","Màn hình tương tác 65\"","Phần mềm CT1 bản quyền","Bảo hành thiết bị 2 năm","Hỗ trợ lắp đặt tại trường"],
  },
  {
    id: "pk-min-2", tier: "minimum", supplierTenantId: "sup-ebd",
    name: "STEM Liên môn — CT1+CT2 THCS",
    description: "Kết hợp CT1 và CT2 cho khối THCS, tích hợp bài giảng EBD.",
    priceVND: 145_000_000, thumbnails: [],
    supportedPrograms: ["CT1","CT2"], supportedGrades: [6,7,8],
    features: ["15 bộ kit liên môn","Tablet HS 15 máy","Bài giảng EBD sẵn có","Bảo hành 2 năm","Tập huấn GV 8 buổi"],
  },
  {
    id: "pk-min-3", tier: "minimum", supplierTenantId: "sup-nexta",
    name: "STEM Tiểu học — CT1 Cơ bản",
    description: "Thiết kế riêng cho cấp Tiểu học, bộ kit an toàn, nhựa cao cấp.",
    priceVND: 98_000_000, thumbnails: [],
    supportedPrograms: ["CT1"], supportedGrades: [1,2,3,4,5],
    discount: 10,
    features: ["Kit nhựa an toàn BPA-free","Phòng 30 chỗ ngồi","Camera quan sát 360°","Bảo hành 3 năm","Vận chuyển miễn phí"],
  },
  {
    id: "pk-min-4", tier: "minimum", supplierTenantId: "sup-gelx",
    name: "STEM Tối giản — CT2 Nhóm",
    description: "Tập trung vào hoạt động nhóm liên môn, chi phí tối ưu nhất.",
    priceVND: 105_000_000, thumbnails: [],
    supportedPrograms: ["CT2"], supportedGrades: [7,8,9],
    features: ["Bàn nhóm modular 6 nhóm","Bảng tương tác thông minh","Giáo án CT2 kèm sẵn","Bảo hành 2 năm"],
  },
  {
    id: "pk-min-5", tier: "minimum", supplierTenantId: "sup-ebd",
    name: "STEM Kết nối — CT1 Lớp 6-7",
    description: "Phù hợp với SGK Kết nối tri thức, sách EBD đã được Bộ GD&ĐT phê duyệt.",
    priceVND: 115_000_000, thumbnails: [],
    supportedPrograms: ["CT1"], supportedGrades: [6,7],
    features: ["SGK Kết nối tích hợp","15 bộ kit điện tử cơ bản","LMS EBD 1 năm","Tập huấn online 5 buổi"],
  },
  {
    id: "pk-min-6", tier: "minimum", supplierTenantId: "sup-nexta",
    name: "STEM Chân trời — CT1 Lớp 8-9",
    description: "Phối hợp SGK Chân trời sáng tạo lớp 8-9, bộ kit thực nghiệm đa năng.",
    priceVND: 128_000_000, thumbnails: [],
    supportedPrograms: ["CT1","CT2"], supportedGrades: [8,9],
    features: ["SGK Chân trời tích hợp","Kit thực nghiệm đa năng","Màn hình 75\" 4K","Bảo hành 2 năm"],
  },

  /* ── Cơ bản (6) ── */
  {
    id: "pk-bas-1", tier: "basic", supplierTenantId: "sup-gelx",
    name: "STEM Phòng Chuẩn — CT1+CT2+CT3",
    description: "Giải pháp toàn diện nhất cho trường THCS triển khai STEM tích hợp.",
    priceVND: 285_000_000, thumbnails: [],
    supportedPrograms: ["CT1","CT2","CT3"], supportedGrades: [6,7,8,9],
    highlight: "Bán chạy",
    features: ["Đầy đủ CT1+CT2+CT3","Phòng buổi 2 tiêu chuẩn","30 bộ kit chuyên sâu","LMS Geleximco 2 năm","Tập huấn GV 20 buổi","Hỗ trợ kỹ thuật 24/7"],
  },
  {
    id: "pk-bas-2", tier: "basic", supplierTenantId: "sup-ebd",
    name: "STEM Tăng cường EBD — CT3",
    description: "Mở rộng từ gói tối thiểu lên CT3, buổi học tăng cường chiều.",
    priceVND: 245_000_000, thumbnails: [],
    supportedPrograms: ["CT1","CT2","CT3"], supportedGrades: [7,8,9],
    features: ["Kế thừa CT1+CT2","Bổ sung kit CT3","Phòng buổi chiều","Bài giảng CT3 EBD","Bảo hành 3 năm"],
  },
  {
    id: "pk-bas-3", tier: "basic", supplierTenantId: "sup-nexta",
    name: "STEM THPT Cơ bản — CT2+CT3",
    description: "Thiết kế riêng cho cấp THPT, tích hợp thiết bị thí nghiệm Lý-Hóa-Sinh.",
    priceVND: 320_000_000, thumbnails: [],
    supportedPrograms: ["CT2","CT3"], supportedGrades: [10,11,12],
    discount: 5,
    features: ["Thiết bị TN Lý-Hóa-Sinh","Phòng 30 HS","Máy tính bảng 15 chiếc","LMS liên kết Nexta","Tập huấn 15 buổi"],
  },
  {
    id: "pk-bas-4", tier: "basic", supplierTenantId: "sup-gelx",
    name: "STEM Tiểu học Nâng cấp — CT1+CT3",
    description: "Mở rộng phòng Tiểu học lên CT3, thêm học liệu thực hành sáng tạo.",
    priceVND: 198_000_000, thumbnails: [],
    supportedPrograms: ["CT1","CT3"], supportedGrades: [3,4,5],
    features: ["Kit sáng tạo Tiểu học","Phòng học linh hoạt","Bảng tương tác nhóm","Ứng dụng học sinh","Bảo hành 3 năm"],
  },
  {
    id: "pk-bas-5", tier: "basic", supplierTenantId: "sup-ebd",
    name: "STEM Chủ đề tích hợp — CT3 EBD",
    description: "Chương trình học theo chủ đề tích hợp Toán-Khoa học, 36 chủ đề/năm.",
    priceVND: 265_000_000, thumbnails: [],
    supportedPrograms: ["CT1","CT2","CT3"], supportedGrades: [6,7,8],
    features: ["36 chủ đề học năm học","Bộ giáo án kèm video","Kit thực hành đa năng","Đánh giá năng lực HS","Support EBD chuyên môn"],
  },
  {
    id: "pk-bas-6", tier: "basic", supplierTenantId: "sup-nexta",
    name: "STEM Liên cấp Cơ bản — TH+THCS",
    description: "Phù hợp trường liên cấp, bộ kit đa dạng từ lớp 3 đến lớp 9.",
    priceVND: 340_000_000, thumbnails: [],
    supportedPrograms: ["CT1","CT2","CT3"], supportedGrades: [3,4,5,6,7,8,9],
    features: ["Kit theo từng khối lớp","2 phòng tích hợp","Quản lý tập trung","Báo cáo hiệu suất","Bảo hành 3 năm"],
  },

  /* ── Nâng cao (6) ── */
  {
    id: "pk-adv-1", tier: "advanced", supplierTenantId: "sup-gelx",
    name: "STEM Robotics Lab — CT4 Toàn diện",
    description: "Phòng Robotics đẳng cấp quốc tế, đầy đủ CT1-CT4, chuẩn thi đấu WRO.",
    priceVND: 680_000_000, thumbnails: [],
    supportedPrograms: ["CT1","CT2","CT3","CT4"], supportedGrades: [6,7,8,9,10,11,12],
    highlight: "Cao cấp nhất",
    features: ["30 bộ Robotics LEGO/VEX","Máy in 3D công nghiệp","Phần mềm lập trình Scratch+Python","LMS Geleximco Premium 3 năm","Chuẩn thi đấu WRO/FLL","Tập huấn GV 40 buổi","Bảo hành 5 năm"],
  },
  {
    id: "pk-adv-2", tier: "advanced", supplierTenantId: "sup-ebd",
    name: "STEM Innovation Hub — CT4+CT5",
    description: "Phòng sáng tạo CLB đa chức năng, hỗ trợ cả CT4 và CT5 ngoại khóa.",
    priceVND: 580_000_000, thumbnails: [],
    supportedPrograms: ["CT3","CT4","CT5"], supportedGrades: [7,8,9,10,11,12],
    features: ["Không gian maker linh hoạt","Máy cắt laser mini","3D Printer 2 máy","IoT lab kit 20 bộ","Studio học tập sáng tạo","Bảo hành 4 năm"],
  },
  {
    id: "pk-adv-3", tier: "advanced", supplierTenantId: "sup-nexta",
    name: "STEM THPT Nâng cao — CT3+CT4",
    description: "Dành riêng cho THPT, tích hợp AI/IoT/Lập trình, chuẩn kỳ thi học sinh giỏi.",
    priceVND: 750_000_000, thumbnails: [],
    supportedPrograms: ["CT2","CT3","CT4"], supportedGrades: [10,11,12],
    discount: 8,
    features: ["Lab AI/IoT chuyên sâu","Server GPU training AI","Bộ mạch Arduino+Raspberry Pi","Phòng máy tính 30 HS","Chuẩn KHSG Quốc gia","Bảo hành 5 năm"],
  },
  {
    id: "pk-adv-4", tier: "advanced", supplierTenantId: "sup-gelx",
    name: "STEM Liên cấp Nâng cao — Full CT",
    description: "Giải pháp tổng thể cho trường liên cấp, phủ đầy đủ CT1-CT5 toàn trường.",
    priceVND: 1_200_000_000, thumbnails: [],
    supportedPrograms: ["CT1","CT2","CT3","CT4","CT5"], supportedGrades: [1,2,3,4,5,6,7,8,9,10,11,12],
    features: ["Phủ CT1-CT5 toàn trường","3 phòng STEM chuyên biệt","LMS tổng thể","Quản lý tập trung đa phòng","Hỗ trợ tư vấn định kỳ","Bảo hành 5 năm + ưu tiên"],
  },
  {
    id: "pk-adv-5", tier: "advanced", supplierTenantId: "sup-ebd",
    name: "STEM CLB Ngoại khóa — CT5 Premium",
    description: "Phòng ngoại khóa STEM linh hoạt CT5, tổ chức CLB, hackathon, event.",
    priceVND: 420_000_000, thumbnails: [],
    supportedPrograms: ["CT4","CT5"], supportedGrades: [6,7,8,9,10,11,12],
    features: ["Không gian đa năng mở","Thiết bị di động kéo đi","Hệ thống booking online","Kit thi đấu hackathon","Bảo hành 3 năm"],
  },
  {
    id: "pk-adv-6", tier: "advanced", supplierTenantId: "sup-nexta",
    name: "STEM Green Lab — CT4 Môi trường",
    description: "Phòng STEM chủ đề môi trường — năng lượng tái tạo, IoT cảm biến xanh.",
    priceVND: 510_000_000, thumbnails: [],
    supportedPrograms: ["CT3","CT4"], supportedGrades: [8,9,10,11,12],
    features: ["Panel năng lượng mặt trời","Cảm biến IoT môi trường","Xe điện tự hành mini","Hệ thống theo dõi CO2","Chứng nhận Green School"],
  },
];

const PAYMENT_METHODS = [
  { id: "vnpay",  label: "VNPAY",        icon: QrCode,    color: "#005BAA", desc: "Quét mã QR qua ví điện tử / ngân hàng" },
  { id: "bank",   label: "Chuyển khoản", icon: Landmark,  color: "#16a34a", desc: "Chuyển khoản ngân hàng thủ công" },
];

const TIER_LABEL: Record<string, string> = {
  minimum: "Tối thiểu",
  basic: "Cơ bản",
  advanced: "Nâng cao",
};

const TIER_ICON: Record<string, React.ElementType> = {
  minimum: Boxes,
  basic: Package,
  advanced: Cpu,
};

/* ── Fake QR visual ─────────────────────────────────────────── */
function FakeQR() {
  const size = 200;
  const cell = 8;
  const cols = Math.floor(size / cell);
  const seed = 0x6a5acd;
  const cells: boolean[] = Array.from({ length: cols * cols }, (_, i) => {
    const v = ((seed ^ (i * 0x9e3779b9 + 0x12345678)) >>> 0) % 3 !== 0;
    const row = Math.floor(i / cols), col = i % cols;
    if ((row < 7 && col < 7) || (row < 7 && col >= cols - 7) || (row >= cols - 7 && col < 7)) return true;
    return v;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" />
      {cells.map((on, i) => {
        if (!on) return null;
        const row = Math.floor(i / cols), col = i % cols;
        return <rect key={i} x={col * cell} y={row * cell} width={cell - 1} height={cell - 1} fill="#111" />;
      })}
    </svg>
  );
}

/* ── Component chính ─────────────────────────────────────────── */
export function SchoolPurchaseFlow() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0]?.id ?? "";

  /* State - landing */
  const [filterTier, setFilterTier] = useState<"all" | "minimum" | "basic" | "advanced">("all");

  /* State - modal */
  const [selectedPkg, setSelectedPkg] = useState<ExtPackage | null>(null);
  const [quantity, setQuantity]     = useState(1);
  const [funding, setFunding]       = useState<typeof FUNDING_SOURCES[number]>("Ngân sách");
  const [distId, setDistId]         = useState(tenantsByType.distributor[0]?.id ?? "");
  const [note, setNote]             = useState("");
  const [payMethod, setPayMethod]   = useState<string | null>(null);
  const [modalStep, setModalStep]   = useState<"config" | "success">("config");

  /* QR timer */
  const [qrSeconds, setQrSeconds]   = useState(300);
  useEffect(() => {
    if (payMethod !== "vnpay") { setQrSeconds(300); return; }
    const t = setInterval(() => setQrSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [payMethod]);

  const fmtTimer = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const distributors = tenantsByType.distributor;
  const total = selectedPkg ? selectedPkg.priceVND * quantity : 0;
  const discountedTotal = selectedPkg?.discount ? Math.round(total * (1 - (selectedPkg.discount / 100))) : total;

  const openModal = useCallback((pkg: ExtPackage) => {
    setSelectedPkg(pkg);
    setQuantity(1);
    setFunding("Ngân sách");
    setDistId(distributors[0]?.id ?? "");
    setNote("");
    setPayMethod(null);
    setModalStep("config");
  }, [distributors]);

  const closeModal = () => setSelectedPkg(null);

  const handleConfirm = () => {
    if (!selectedPkg) return;
    const today = new Date().toISOString().split("T")[0];
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const newCourse: SchoolCourse = {
      id: `SC-NEW-${Date.now()}`,
      schoolId: tenantId,
      programCode: selectedPkg.supportedPrograms[0] ?? "CT1",
      programName: selectedPkg.name,
      packageTier: selectedPkg.tier,
      subject: "STEM",
      grade: selectedPkg.supportedGrades[0] ?? 6,
      totalLessons: 30 * quantity,
      completedLessons: 0,
      purchaseDate: today,
      expiryDate: expiry.toISOString().split("T")[0],
      licenseSeats: quantity * 30,
      seatsUsed: 0,
      assignedClasses: [],
      status: "active",
    };
    try {
      const key = `gstem_courses_${tenantId}`;
      const prev: SchoolCourse[] = JSON.parse(localStorage.getItem(key) ?? "[]");
      localStorage.setItem(key, JSON.stringify([...prev, newCourse]));
    } catch { /* ignore */ }
    setModalStep("success");
  };

  const filtered = EXTENDED.filter((p) => filterTier === "all" || p.tier === filterTier);

  const tierCounts = {
    all: EXTENDED.length,
    minimum: EXTENDED.filter((p) => p.tier === "minimum").length,
    basic: EXTENDED.filter((p) => p.tier === "basic").length,
    advanced: EXTENDED.filter((p) => p.tier === "advanced").length,
  };

  /* ── Render ── */
  return (
    <div className="min-h-full">
      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 px-8 py-10"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2563eb 100%)" }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 25% 50%, #c8a84e 1px, transparent 1px), radial-gradient(circle at 75% 50%, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-white/80 border border-white/20 backdrop-blur-sm" style={{ fontSize: "11px", fontWeight: 600, background: "rgba(255,255,255,0.1)" }}>
                🏫 Dành cho Trường học
              </span>
            </div>
            <h1 className="text-white" style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1.2 }}>
              Danh mục Gói Phòng STEM
            </h1>
            <p className="text-white/70 mt-2" style={{ fontSize: "14px", maxWidth: 500 }}>
              Chọn gói phù hợp với quy mô, ngân sách và mục tiêu STEM của trường. Đầy đủ CT1–CT5, nhiều nhà cung cấp.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              {[
                { icon: Shield, text: "Bảo hành chính hãng" },
                { icon: Wrench, text: "Hỗ trợ lắp đặt" },
                { icon: GraduationCap, text: "Tập huấn GV kèm" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-white/60" style={{ fontSize: "12px" }}>
                  <Icon className="w-3.5 h-3.5 text-[#c8a84e]" />
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            {(["minimum","basic","advanced"] as const).map((t) => {
              const tier = STEM_TIERS[t];
              const TIcon = TIER_ICON[t];
              return (
                <div key={t} className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <TIcon className="w-6 h-6" style={{ color: tier.color }} />
                  <span className="text-white" style={{ fontSize: "11px", fontWeight: 600 }}>{TIER_LABEL[t]}</span>
                  <span style={{ fontSize: "10px", color: tier.color, fontWeight: 700 }}>{tierCounts[t]} gói</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {([
          { key: "all",      label: "Tất cả",     count: tierCounts.all },
          { key: "minimum",  label: "Tối thiểu",  count: tierCounts.minimum },
          { key: "basic",    label: "Cơ bản",     count: tierCounts.basic },
          { key: "advanced", label: "Nâng cao",   count: tierCounts.advanced },
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterTier(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
              filterTier === key
                ? "bg-[#990803] text-white border-[#990803] shadow-sm"
                : "bg-card border-border text-foreground/70 hover:border-[#990803]/40 hover:text-foreground"
            }`}
            style={{ fontSize: "13px", fontWeight: filterTier === key ? 600 : 400 }}
          >
            {label}
            <span className={`px-1.5 py-0.5 rounded-full ${filterTier === key ? "bg-white/20" : "bg-secondary"}`} style={{ fontSize: "10px", fontWeight: 700 }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Package grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((pkg) => {
          const tier = STEM_TIERS[pkg.tier];
          const TIcon = TIER_ICON[pkg.tier];
          const afterDiscount = pkg.discount ? Math.round(pkg.priceVND * (1 - pkg.discount / 100)) : null;
          return (
            <div
              key={pkg.id}
              className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              {/* Card header */}
              <div
                className="relative h-32 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${tier.color}25, ${tier.color}08)` }}
              >
                <TIcon className="w-14 h-14 opacity-20 absolute" style={{ color: tier.color }} />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <TierBadge tier={pkg.tier} size="md" />
                  <div className="flex flex-wrap gap-1 justify-center">
                    {pkg.supportedPrograms.slice(0, 4).map((c) => <ProgramBadge key={c} code={c} size="xs" />)}
                  </div>
                </div>
                {pkg.highlight && (
                  <div
                    className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full text-white"
                    style={{ fontSize: "10px", fontWeight: 700, background: tier.color }}
                  >
                    <Star className="w-2.5 h-2.5" />
                    {pkg.highlight}
                  </div>
                )}
                {pkg.discount && (
                  <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full bg-[#dc2626] text-white" style={{ fontSize: "10px", fontWeight: 700 }}>
                    -{pkg.discount}%
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 p-4 gap-3">
                <div>
                  <h3 className="text-foreground leading-snug" style={{ fontSize: "14px", fontWeight: 700 }}>{pkg.name}</h3>
                  <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "12px" }}>{pkg.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-1">
                  {pkg.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: tier.color }} />
                      <span className="text-foreground/70" style={{ fontSize: "11.5px" }}>{f}</span>
                    </li>
                  ))}
                  {pkg.features.length > 4 && (
                    <li className="text-muted-foreground" style={{ fontSize: "11px" }}>+{pkg.features.length - 4} tính năng khác</li>
                  )}
                </ul>

                {/* Grades */}
                <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "11px" }}>
                  <GraduationCap className="w-3 h-3" />
                  Lớp {pkg.supportedGrades.slice(0, 4).join(", ")}{pkg.supportedGrades.length > 4 ? "..." : ""}
                </div>

                {/* Price */}
                <div className="mt-auto pt-3 border-t border-border">
                  <div className="flex items-end justify-between">
                    <div>
                      {afterDiscount ? (
                        <>
                          <p className="text-muted-foreground line-through" style={{ fontSize: "11px" }}>{formatVND(pkg.priceVND)}</p>
                          <p style={{ fontSize: "18px", fontWeight: 800, color: "#dc2626" }}>{formatVND(afterDiscount)}</p>
                        </>
                      ) : (
                        <p style={{ fontSize: "18px", fontWeight: 800, color: tier.color }}>{formatVND(pkg.priceVND)}</p>
                      )}
                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>/ gói phòng</p>
                    </div>
                    <button
                      onClick={() => openModal(pkg)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
                      style={{ fontSize: "13px", fontWeight: 600, background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)` }}
                    >
                      Đặt mua
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODAL                                                    */}
      {/* ════════════════════════════════════════════════════════ */}
      {selectedPkg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
            style={{ maxWidth: payMethod ? 900 : 520, maxHeight: "90vh" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: STEM_TIERS[selectedPkg.tier].color + "20" }}>
                  <ShoppingBag className="w-5 h-5" style={{ color: STEM_TIERS[selectedPkg.tier].color }} />
                </div>
                <div>
                  <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>
                    {modalStep === "success" ? "Hóa đơn xác nhận" : "Đặt mua gói STEM"}
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{selectedPkg.name}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto">
              {modalStep === "success" ? (
                /* ── SUCCESS SCREEN ── */
                <SuccessScreen
                  pkg={selectedPkg}
                  quantity={quantity}
                  total={discountedTotal}
                  dist={distributors.find((d) => d.id === distId)?.name ?? "—"}
                  funding={funding}
                  note={note}
                  onClose={closeModal}
                />
              ) : (
                /* ── CONFIG + PAYMENT ── */
                <div className={`flex ${payMethod ? "divide-x divide-border" : ""}`}>
                  {/* Left: form */}
                  <div className="flex-1 p-5 space-y-4 overflow-y-auto" style={{ minWidth: 320 }}>
                    {/* Gói đã chọn */}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: STEM_TIERS[selectedPkg.tier].color + "15" }}>
                        {(() => { const TIcon = TIER_ICON[selectedPkg.tier]; return <TIcon className="w-5 h-5" style={{ color: STEM_TIERS[selectedPkg.tier].color }} />; })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{selectedPkg.name}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                          {formatVND(selectedPkg.priceVND)} / gói {selectedPkg.discount ? `→ -${selectedPkg.discount}%` : ""}
                        </p>
                      </div>
                      <TierBadge tier={selectedPkg.tier} size="sm" />
                    </div>

                    {/* Số lượng */}
                    <div>
                      <label className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10.5px", fontWeight: 700 }}>Số lượng gói</label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/60 flex items-center justify-center text-lg font-bold">−</button>
                        <input
                          type="number" min={1} value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                          className="w-16 text-center px-2 py-2 bg-background border border-border rounded-lg outline-none"
                          style={{ fontSize: "16px", fontWeight: 700 }}
                        />
                        <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/60 flex items-center justify-center text-lg font-bold">+</button>
                        <span className="text-muted-foreground" style={{ fontSize: "12px" }}>phòng</span>
                      </div>
                    </div>

                    {/* Nguồn kinh phí */}
                    <div>
                      <label className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10.5px", fontWeight: 700 }}>Nguồn kinh phí</label>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {FUNDING_SOURCES.map((f) => (
                          <button
                            key={f}
                            onClick={() => setFunding(f)}
                            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                              funding === f ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
                            }`}
                            style={{ fontSize: "12px", fontWeight: 500 }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Đại lý */}
                    <div>
                      <label className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10.5px", fontWeight: 700 }}>Đại lý môi giới</label>
                      <div className="space-y-1.5 mt-1.5">
                        {distributors.map((d) => (
                          <label key={d.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${distId === d.id ? "border-[#990803] bg-[#990803]/5" : "border-border hover:bg-secondary"}`}>
                            <input type="radio" name="dist2" checked={distId === d.id} onChange={() => setDistId(d.id)} className="accent-[#990803]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground truncate" style={{ fontSize: "12.5px", fontWeight: 600 }}>{d.name}</p>
                              {d.coverageProvinces && (
                                <p className="text-muted-foreground truncate" style={{ fontSize: "10.5px" }}>{d.coverageProvinces.slice(0,3).join(", ")}</p>
                              )}
                            </div>
                            {distId === d.id && <Check className="w-4 h-4 text-[#2563eb] shrink-0" />}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Ghi chú */}
                    <div>
                      <label className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10.5px", fontWeight: 700 }}>Ghi chú (tùy chọn)</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ví dụ: ưu tiên lắp đặt trước 15/8 để kịp năm học mới..."
                        className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg outline-none resize-none"
                        rows={2}
                        style={{ fontSize: "12.5px" }}
                      />
                    </div>

                    {/* Phương thức thanh toán */}
                    <div>
                      <label className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: "10.5px", fontWeight: 700 }}>Phương thức thanh toán</label>
                      <div className="grid grid-cols-3 gap-2 mt-1.5">
                        {PAYMENT_METHODS.map((m) => {
                          const MIcon = m.icon;
                          const active = payMethod === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setPayMethod(active ? null : m.id)}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                                active ? "shadow-md" : "border-border hover:bg-secondary"
                              }`}
                              style={{
                                borderColor: active ? m.color : undefined,
                                background: active ? m.color + "10" : undefined,
                              }}
                            >
                              <MIcon className="w-5 h-5" style={{ color: active ? m.color : undefined }} />
                              <span style={{ fontSize: "11px", fontWeight: 600, color: active ? m.color : undefined }}>{m.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {payMethod && (
                        <p className="text-muted-foreground mt-1.5" style={{ fontSize: "11px" }}>
                          {PAYMENT_METHODS.find((m) => m.id === payMethod)?.desc}
                        </p>
                      )}
                    </div>

                    {/* Tổng tiền */}
                    <div className="p-3 rounded-xl border border-border bg-gradient-to-r from-secondary/50 to-secondary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Tổng thanh toán</span>
                        <div className="text-right">
                          {selectedPkg.discount && (
                            <p className="text-muted-foreground line-through" style={{ fontSize: "11px" }}>{formatVND(total)}</p>
                          )}
                          <p className="text-[#990803]" style={{ fontSize: "20px", fontWeight: 800 }}>{formatVND(discountedTotal)}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10.5px" }}>
                        {quantity} × {selectedPkg.name} · {funding}
                      </p>
                    </div>

                    {/* CTA */}
                    <button
                      disabled={!payMethod}
                      onClick={handleConfirm}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ fontSize: "14px", fontWeight: 700, background: payMethod ? "linear-gradient(135deg, #16a34a, #15803d)" : undefined, backgroundColor: !payMethod ? "#94a3b8" : undefined }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Xác nhận thanh toán
                    </button>
                    {!payMethod && (
                      <p className="text-center text-muted-foreground" style={{ fontSize: "11px" }}>Vui lòng chọn phương thức thanh toán</p>
                    )}
                  </div>

                  {/* Right: payment panel */}
                  {payMethod && (
                    <div className="w-72 shrink-0 p-5 flex flex-col items-center gap-4 bg-secondary/20">
                      {payMethod === "vnpay" && (
                        <>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <QrCode className="w-4 h-4 text-[#005BAA]" />
                              <span className="text-[#005BAA]" style={{ fontSize: "13px", fontWeight: 700 }}>Thanh toán VNPAY</span>
                            </div>
                            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Quét mã QR bằng ứng dụng ngân hàng</p>
                          </div>
                          <div className="p-3 bg-white rounded-2xl shadow-md">
                            <FakeQR />
                          </div>
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${qrSeconds > 60 ? "bg-[#16a34a]/10 text-[#16a34a]" : "bg-[#dc2626]/10 text-[#dc2626]"}`}>
                            <Clock className="w-4 h-4" />
                            <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: "monospace" }}>{fmtTimer(qrSeconds)}</span>
                            <span style={{ fontSize: "11px" }}>còn lại</span>
                          </div>
                          {qrSeconds === 0 && (
                            <button onClick={() => setQrSeconds(300)} className="text-[#005BAA] hover:underline" style={{ fontSize: "12px" }}>
                              Làm mới mã QR
                            </button>
                          )}
                          <div className="w-full p-3 rounded-xl bg-card border border-border">
                            <p className="text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 600 }}>SỐ TIỀN</p>
                            <p className="text-[#005BAA]" style={{ fontSize: "18px", fontWeight: 800 }}>{formatVND(discountedTotal)}</p>
                            <p className="text-muted-foreground mt-1" style={{ fontSize: "10.5px" }}>Mã GD: GSTEM-{Date.now().toString().slice(-8)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {["VCB", "TCB", "MB", "BIDV", "Vietinbank"].map((b) => (
                              <span key={b} className="px-2 py-1 rounded-md bg-card border border-border text-muted-foreground" style={{ fontSize: "10px" }}>{b}</span>
                            ))}
                          </div>
                        </>
                      )}

                      {payMethod === "bank" && (
                        <>
                          <div className="text-center">
                            <Landmark className="w-8 h-8 mx-auto text-[#16a34a] mb-2" />
                            <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>Chuyển khoản ngân hàng</p>
                          </div>
                          <div className="w-full space-y-2">
                            {[
                              { label: "Ngân hàng", value: "Vietcombank (VCB)" },
                              { label: "Số tài khoản", value: "1234 5678 9012 3456" },
                              { label: "Chủ tài khoản", value: "CONG TY GELEXIMCO" },
                              { label: "Số tiền", value: formatVND(discountedTotal) },
                              { label: "Nội dung CK", value: `GSTEM ${tenantId.slice(0,8).toUpperCase()} ${quantity}GOI` },
                            ].map(({ label, value }) => (
                              <div key={label} className="px-3 py-2 rounded-lg bg-card border border-border">
                                <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{label}</p>
                                <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{value}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-muted-foreground text-center" style={{ fontSize: "10.5px" }}>
                            Sau chuyển khoản, nhấn "Xác nhận thanh toán" để hệ thống ghi nhận.
                          </p>
                        </>
                      )}

                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Success Screen ─────────────────────────────────────────── */
function SuccessScreen({ pkg, quantity, total, dist, funding, note, onClose }: {
  pkg: ExtPackage;
  quantity: number;
  total: number;
  dist: string;
  funding: string;
  note: string;
  onClose: () => void;
}) {
  const orderId = `GS-${Date.now().toString().slice(-8)}`;
  const today = new Date().toLocaleDateString("vi-VN");
  return (
    <div className="p-8 flex flex-col items-center gap-5">
      {/* Success animation */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-[#16a34a]" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#c8a84e] flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-foreground" style={{ fontSize: "20px", fontWeight: 800 }}>Đặt hàng thành công!</h2>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
          Hệ thống đã ghi nhận. Đại lý sẽ liên hệ trong <strong>24 giờ</strong>.
        </p>
      </div>

      {/* Invoice card */}
      <div className="w-full max-w-sm bg-secondary/30 rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-border">
          <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>Hóa đơn xác nhận</span>
          <span className="font-mono text-muted-foreground" style={{ fontSize: "11px" }}>#{orderId}</span>
        </div>
        <div className="p-4 space-y-2.5">
          {[
            { label: "Gói STEM",        value: pkg.name },
            { label: "Tier",            value: TIER_LABEL[pkg.tier] },
            { label: "Số lượng",        value: `${quantity} gói phòng` },
            { label: "Đại lý",          value: dist },
            { label: "Nguồn kinh phí",  value: funding },
            ...(note ? [{ label: "Ghi chú", value: note }] : []),
            { label: "Ngày đặt hàng",   value: today },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{label}</span>
              <span className="text-foreground text-right" style={{ fontSize: "12px", fontWeight: 500 }}>{value}</span>
            </div>
          ))}
          <div className="pt-2.5 border-t border-border flex items-center justify-between">
            <span className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>Tổng thanh toán</span>
            <span className="text-[#990803]" style={{ fontSize: "20px", fontWeight: 800 }}>{formatVND(total)}</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-2">
        {[
          { icon: Check,        color: "#16a34a", text: "Đơn hàng đã ghi nhận vào hệ thống",       done: true },
          { icon: Building2,    color: "#2563eb", text: "Đại lý xác nhận & liên hệ trường (24h)",  done: false },
          { icon: CreditCard,   color: "#c8a84e", text: "Ký hợp đồng & thanh toán (3-5 ngày)",     done: false },
          { icon: Award,        color: "#7c3aed", text: "Triển khai lắp đặt (14-21 ngày)",          done: false },
        ].map(({ icon: Icon, color, text, done }) => (
          <div key={text} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: color + (done ? "20" : "10") }}>
              <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <span className={done ? "text-foreground" : "text-muted-foreground"} style={{ fontSize: "12px", fontWeight: done ? 600 : 400 }}>{text}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary transition-colors"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          Đặt mua thêm
        </button>
        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#990803] text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: "13px", fontWeight: 600 }}
        >
          <BookOpen className="w-4 h-4" />
          Xem Khóa học
        </button>
      </div>
    </div>
  );
}

export default SchoolPurchaseFlow;
