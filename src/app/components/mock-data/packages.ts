import type { StemPackage } from "./types";

/* ================================================================ */
/*  STEM PACKAGES — 3 tier gói phòng học STEM                        */
/* ================================================================ */

export const stemPackages: StemPackage[] = [
  {
    id: "PKG-MIN",
    tier: "minimum",
    supplierTenantId: "T-SUP-01",
    name: "Gói STEM Tối thiểu",
    description:
      "Bộ dụng cụ STEM tại nhà hoặc tại lớp với chi phí thấp, phù hợp trường vùng sâu. " +
      "Đáp ứng chương trình CT1 sơ cấp, từ Mầm non đến Tiểu học.",
    priceVND: 32_000_000,
    supportedGrades: ["Mầm non", "Tiểu học"],
    supportedPrograms: ["CT1"],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnails: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=800&q=80",
    ],
    includedEquipment: [
      { category: "Dụng cụ khám phá", name: "Bộ dụng cụ khoa học cơ bản",       quantity: 20, unitPriceVND: 450_000,  specs: "Nhựa an toàn" },
      { category: "Dụng cụ khám phá", name: "Bộ lắp ghép cơ khí sơ cấp",         quantity: 15, unitPriceVND: 680_000 },
      { category: "Hóa chất",         name: "Hộp thí nghiệm màu & trộn",         quantity: 10, unitPriceVND: 320_000 },
      { category: "Tài liệu",         name: "Sách hướng dẫn GV CT1",             quantity: 5,  unitPriceVND: 180_000 },
    ],
    includedSoftware: [
      { name: "Geleximco STEM Explorer (Demo)", version: "1.0", licenseType: "per_user", seats: 10 },
    ],
    configuration: {
      infrastructure: ["Không yêu cầu đặc biệt", "Góc học 6-8 m²"],
      smartDevices: ["Tablet giáo viên (tùy chọn)"],
      furniture: ["Bàn nhóm 4 HS × 3 bộ", "Kệ để dụng cụ"],
      decoration: ["Poster 5 chương trình", "Banner STEM"],
    },
    active: true,
    publishedAt: "2024-05-01T00:00:00Z",
    status: "active",
    packageType: "template",
    equipmentCostVND: 20_060_000,
    installationFeeVND: 2_000_000,
    trainingDays: 1,
    warrantyMonths: 12,
    createdBy: "U-SUP-01",
    approvedBy: "U-SUP-01",
  },
  {
    id: "PKG-BAS",
    tier: "basic",
    supplierTenantId: "T-SUP-01",
    name: "Gói STEM Cơ bản",
    description:
      "Phòng Lab STEM 1 + Robotic cơ bản, đáp ứng CT1–CT2. " +
      "Cho Tiểu học, THCS, trường đạt chuẩn quốc gia.",
    priceVND: 180_000_000,
    supportedGrades: ["Tiểu học", "THCS"],
    supportedPrograms: ["CT1", "CT2"],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnails: [
      "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581093057305-7e63bbfe8c79?auto=format&fit=crop&w=800&q=80",
    ],
    includedEquipment: [
      { category: "Robotic",    name: "Bộ robot lập trình cơ bản",        quantity: 10, unitPriceVND: 4_500_000, specs: "Mbot, Micro:bit" },
      { category: "Lab",        name: "Kính hiển vi điện tử HS",           quantity: 6,  unitPriceVND: 2_800_000 },
      { category: "Điện tử",    name: "Bộ mạch Arduino Starter",           quantity: 15, unitPriceVND: 850_000 },
      { category: "In 3D",      name: "Máy in 3D EDU",                     quantity: 1,  unitPriceVND: 18_000_000 },
      { category: "Hiển thị",   name: "Smart TV 65\" hỗ trợ trình chiếu",   quantity: 1,  unitPriceVND: 22_000_000 },
      { category: "Tài liệu",   name: "Giáo án CT1+CT2 đa bộ môn",          quantity: 1,  unitPriceVND: 5_000_000 },
    ],
    includedSoftware: [
      { name: "Geleximco STEM Studio",   version: "2.1", licenseType: "per_user",   seats: 40 },
      { name: "Robotic Programming IDE", version: "3.0", licenseType: "per_user", seats: 10 },
    ],
    configuration: {
      infrastructure: ["Phòng 40-60 m²", "Điện 3 pha", "Wifi AP riêng", "Bàn chống tĩnh điện"],
      smartDevices: ["Smart TV 65\"", "Tablet 10\" × 15", "Camera ghi hình tiết học"],
      furniture: ["Bàn nhóm 6 HS × 5 bộ", "Tủ dụng cụ", "Kệ robot", "Bảng trắng/thông minh"],
      decoration: ["Decal 5 chương trình STEM", "Poster SGK liên kết", "Khu vực trưng bày sản phẩm HS"],
    },
    active: true,
    publishedAt: "2024-05-01T00:00:00Z",
    status: "active",
    packageType: "template",
    equipmentCostVND: 98_500_000,
    installationFeeVND: 5_000_000,
    trainingDays: 2,
    warrantyMonths: 24,
    createdBy: "U-SUP-01",
    approvedBy: "U-SUP-01",
  },
  {
    id: "PKG-ADV",
    tier: "advanced",
    supplierTenantId: "T-SUP-01",
    name: "Gói STEM Nâng cao",
    description:
      "AI · IoT · Robotic — đồng hành 5 năm, đáp ứng CT3, CT4, CT5. " +
      "Cho THCS, THPT, THPT Nghề, trường trọng điểm / chất lượng cao.",
    priceVND: 680_000_000,
    supportedGrades: ["THCS", "THPT", "THPT Nghề"],
    supportedPrograms: ["CT3", "CT4", "CT5"],
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnails: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1628359355624-855775b5c9c4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581093057305-7e63bbfe8c79?auto=format&fit=crop&w=800&q=80",
    ],
    includedEquipment: [
      { category: "Robotic AI",  name: "Bộ robot nâng cao Lego SPIKE Prime", quantity: 12, unitPriceVND: 12_500_000 },
      { category: "Robotic AI",  name: "Cánh tay robot giảng dạy",            quantity: 2,  unitPriceVND: 65_000_000 },
      { category: "AI Server",   name: "Workstation GPU (NVIDIA RTX)",         quantity: 2,  unitPriceVND: 85_000_000 },
      { category: "IoT",         name: "Kit cảm biến IoT + Gateway",           quantity: 10, unitPriceVND: 4_800_000 },
      { category: "In 3D",       name: "Máy in 3D chuyên nghiệp (Resin+FDM)",  quantity: 2,  unitPriceVND: 45_000_000 },
      { category: "Cắt laser",   name: "Máy cắt laser CO2",                    quantity: 1,  unitPriceVND: 75_000_000 },
      { category: "Drone",       name: "Drone giáo dục (lập trình)",           quantity: 4,  unitPriceVND: 18_000_000 },
      { category: "VR",          name: "Bộ kính thực tế ảo Meta Quest",        quantity: 6,  unitPriceVND: 12_000_000 },
      { category: "Hiển thị",    name: "Smart Interactive Board 86\"",          quantity: 1,  unitPriceVND: 85_000_000 },
      { category: "Tài liệu",    name: "Chương trình đồng hành 5 năm + SGK",   quantity: 1,  unitPriceVND: 25_000_000 },
    ],
    includedSoftware: [
      { name: "Geleximco STEM Studio Pro", version: "3.2", licenseType: "per_user",   seats: 80 },
      { name: "Geleximco STEM Tutor",       version: "1.5", licenseType: "per_user",   seats: 80 },
      { name: "IoT Platform",              version: "2.0", licenseType: "per_user",   seats: 80 },
      { name: "Robotic Suite",             version: "4.0", licenseType: "per_user",   seats: 14 },
    ],
    configuration: {
      infrastructure: [
        "Phòng 80-120 m² (2 khu)",
        "Điện 3 pha + UPS",
        "Mạng cáp quang 1Gbps + Wifi 6 mesh",
        "Điều hòa âm trần + lọc bụi HEPA",
        "Bàn thí nghiệm chống axit",
        "Hệ thống chống tĩnh điện"
      ],
      smartDevices: [
        "Interactive Board 86\"",
        "Tablet 12\" × 40 (học sinh)",
        "Laptop workstation × 10",
        "Camera AI ghi hình giảng dạy",
        "Hệ âm thanh + micro không dây"
      ],
      furniture: [
        "Bàn nhóm mô-đun × 10",
        "Tủ bảo quản thiết bị đắt tiền",
        "Kệ robot + kệ trưng bày sản phẩm",
        "Khu trình bày NCKH (CT5)",
        "Ghế công thái học"
      ],
      decoration: [
        "Wall décor 5 chương trình",
        "Khu Hall of Fame sản phẩm HS",
        "Poster AI, IoT, Robotics",
        "Bảng tiến độ đồng hành 5 năm"
      ],
    },
    active: true,
    publishedAt: "2024-05-01T00:00:00Z",
    status: "active",
    packageType: "template",
    equipmentCostVND: 590_000_000,
    installationFeeVND: 15_000_000,
    trainingDays: 5,
    warrantyMonths: 36,
    createdBy: "U-SUP-01",
    approvedBy: "U-SUP-01",
  },

  /* ── Nexta Education packages — T-SUP-02 (isolation demo AD-04) ── */
  {
    id: "NXT-BAS",
    tier: "basic",
    supplierTenantId: "T-SUP-02",
    name: "Nexta STEM Cơ bản",
    description:
      "Giải pháp phòng STEM của Nexta Education — tích hợp phần mềm LMS Nexta Cloud " +
      "và bộ thiết bị Robotic riêng. Đáp ứng CT1–CT2 cho Tiểu học và THCS.",
    priceVND: 165_000_000,
    supportedGrades: ["Tiểu học", "THCS"],
    supportedPrograms: ["CT1", "CT2"],
    thumbnails: [
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80",
    ],
    includedEquipment: [
      { category: "Robotic", name: "Bộ kit Nexta Bot",        quantity: 10, unitPriceVND: 3_800_000 },
      { category: "Hiển thị", name: "Smart Board 65\" Nexta", quantity: 1,  unitPriceVND: 25_000_000 },
      { category: "Tài liệu", name: "Sách giáo án Nexta CT1–CT2", quantity: 1, unitPriceVND: 4_000_000 },
    ],
    includedSoftware: [
      { name: "Nexta Cloud LMS", version: "4.0", licenseType: "per_user", seats: 40 },
    ],
    configuration: {
      infrastructure: ["Phòng 40-60 m²", "Wifi riêng"],
      smartDevices: ["Smart Board 65\"", "Tablet × 10"],
      furniture: ["Bàn nhóm × 5", "Tủ thiết bị"],
      decoration: ["Poster Nexta STEM"],
    },
    active: true,
    publishedAt: "2024-09-01T00:00:00Z",
    status: "active",
    packageType: "template",
    equipmentCostVND: 91_000_000,
    installationFeeVND: 4_000_000,
    trainingDays: 2,
    warrantyMonths: 24,
    createdBy: "U-SUP-02",
    approvedBy: "U-SUP-02",
  },
  {
    id: "NXT-ADV",
    tier: "advanced",
    supplierTenantId: "T-SUP-02",
    name: "Nexta STEM Nâng cao",
    description:
      "Gói cao cấp Nexta — AI + IoT tích hợp LMS Nexta Cloud. Đáp ứng CT3–CT5 cho THCS, THPT.",
    priceVND: 620_000_000,
    supportedGrades: ["THCS", "THPT"],
    supportedPrograms: ["CT3", "CT4", "CT5"],
    thumbnails: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    ],
    includedEquipment: [
      { category: "Robotic AI", name: "Nexta Arm Robot Pro",       quantity: 2,  unitPriceVND: 55_000_000 },
      { category: "AI Server",  name: "Nexta AI Workstation",       quantity: 1,  unitPriceVND: 90_000_000 },
      { category: "IoT",        name: "Nexta IoT Starter Kit × 10", quantity: 10, unitPriceVND: 5_200_000 },
      { category: "Drone",      name: "Nexta Drone EDU",            quantity: 3,  unitPriceVND: 22_000_000 },
    ],
    includedSoftware: [
      { name: "Nexta Cloud LMS Pro",  version: "4.5", licenseType: "per_user", seats: 80 },
      { name: "Nexta AI Studio",      version: "2.0", licenseType: "per_user", seats: 80 },
    ],
    configuration: {
      infrastructure: ["Phòng 80-120 m²", "Mạng 1Gbps", "Điều hòa âm trần"],
      smartDevices: ["Interactive Board 86\"", "Tablet × 30", "Camera AI"],
      furniture: ["Bàn nhóm mô-đun × 8", "Tủ bảo quản thiết bị"],
      decoration: ["Wall décor Nexta 5 CT", "Hall of Fame sản phẩm HS"],
    },
    active: true,
    publishedAt: "2024-09-01T00:00:00Z",
    status: "active",
    packageType: "template",
    equipmentCostVND: 538_000_000,
    installationFeeVND: 12_000_000,
    trainingDays: 4,
    warrantyMonths: 36,
    createdBy: "U-SUP-02",
    approvedBy: "U-SUP-02",
  },

  /* ── Draft packages — demo vòng đời ── */
  {
    id: "PKG-DRAFT-01",
    tier: "basic",
    supplierTenantId: "T-SUP-01",
    name: "Gói STEM Cơ bản v2 (Đang soạn)",
    description:
      "Phiên bản nâng cấp Gói Cơ bản — tích hợp thêm module IoT cơ bản và bộ cảm biến môi trường. " +
      "Đáp ứng CT1–CT3, phù hợp THCS trường chuẩn quốc gia.",
    priceVND: 210_000_000,
    supportedGrades: ["Tiểu học", "THCS"],
    supportedPrograms: ["CT1", "CT2", "CT3"],
    thumbnails: [],
    includedEquipment: [
      { category: "Robotic", name: "Bộ robot lập trình cơ bản", quantity: 10, unitPriceVND: 4_500_000 },
      { category: "IoT",     name: "Kit cảm biến IoT cơ bản",   quantity: 5,  unitPriceVND: 2_800_000 },
      { category: "Hiển thị", name: "Smart TV 65\"",              quantity: 1,  unitPriceVND: 22_000_000 },
    ],
    includedSoftware: [
      { name: "Geleximco STEM Studio", version: "2.2", licenseType: "per_user", seats: 40 },
    ],
    configuration: {
      infrastructure: ["Phòng 40-60 m²", "Wifi AP riêng"],
      smartDevices: ["Smart TV 65\"", "Tablet × 15"],
      furniture: ["Bàn nhóm × 5", "Tủ dụng cụ"],
      decoration: ["Decal 5 CT"],
    },
    active: false,
    publishedAt: "",
    status: "draft",
    packageType: "template",
    equipmentCostVND: 81_000_000,
    installationFeeVND: 5_000_000,
    trainingDays: 2,
    warrantyMonths: 24,
    createdBy: "U-SUP-01",
  },
  {
    id: "PKG-WAIT-01",
    tier: "advanced",
    supplierTenantId: "T-SUP-01",
    name: "Gói STEM Nâng cao — THPT Nghề",
    description:
      "Gói chuyên biệt cho khối THPT Nghề — tập trung vào thực hành nghề kỹ thuật, " +
      "điện tử, cơ khí và lập trình nhúng. Đáp ứng CT4–CT5.",
    priceVND: 450_000_000,
    supportedGrades: ["THPT Nghề"],
    supportedPrograms: ["CT4", "CT5"],
    thumbnails: [],
    includedEquipment: [
      { category: "Cơ khí",   name: "Bộ thực hành cơ khí CNC cơ bản", quantity: 2, unitPriceVND: 85_000_000 },
      { category: "Điện tử",  name: "Bộ mạch lập trình nhúng",          quantity: 20, unitPriceVND: 1_200_000 },
      { category: "Robot AI", name: "Robot công nghiệp mini",            quantity: 1,  unitPriceVND: 95_000_000 },
    ],
    includedSoftware: [
      { name: "Geleximco STEM Studio Pro", version: "3.2", licenseType: "per_user", seats: 40 },
    ],
    configuration: {
      infrastructure: ["Xưởng thực hành 80 m²", "Điện 3 pha"],
      smartDevices: ["Màn hình công nghiệp × 4"],
      furniture: ["Bàn thực hành CNC × 2", "Tủ dụng cụ an toàn"],
      decoration: ["Biển an toàn lao động", "Poster quy trình nghề"],
    },
    active: false,
    publishedAt: "",
    status: "waiting_approval",
    packageType: "template",
    equipmentCostVND: 289_000_000,
    installationFeeVND: 12_000_000,
    trainingDays: 3,
    warrantyMonths: 24,
    createdBy: "U-SUP-01",
    submittedAt: "2026-05-15T09:00:00Z",
  },
];

export function findPackage(id: string): StemPackage | undefined {
  return stemPackages.find((p) => p.id === id);
}

/** Lọc gói theo NCC — AD-04 competitive isolation */
export function packagesBySupplier(supplierTenantId: string): StemPackage[] {
  return stemPackages.filter((p) => p.supplierTenantId === supplierTenantId);
}
