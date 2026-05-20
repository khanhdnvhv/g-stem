import type { SolutionTier } from "./types";

export const solutionTiers: SolutionTier[] = [
  {
    id: "minimum",
    name: "Phòng STEM Tối thiểu",
    tagline: "Khởi đầu STEM cho mọi trường",
    description:
      "Gói thiết bị cơ bản giúp nhà trường tiếp cận chương trình STEM mà không cần đầu tư lớn. Phù hợp khởi điểm cho trường công ở khu vực ngân sách hạn chế.",
    suitableFor: ["MN", "TH", "THCS"],
    programsSupported: ["CT1", "CT2"],
    highlights: [
      "Triển khai nhanh trong 2-4 tuần",
      "Đào tạo GV cốt cán đi kèm",
      "Tài liệu chuẩn Bộ GD&ĐT",
      "Bảo hành 24 tháng",
    ],
    bomCategories: [
      "Bàn ghế chuyên dụng (10-15 chỗ)",
      "Bộ thiết bị STEM cơ bản",
      "Học liệu CT1, CT2",
      "Tài liệu giáo viên + học sinh",
      "Tập huấn GV (2 ngày)",
    ],
  },
  {
    id: "basic",
    name: "Phòng STEM Cơ bản",
    tagline: "Đầy đủ tính năng cho trường vừa",
    description:
      "Trang bị toàn diện cho trường tiểu học, THCS quy mô vừa với đầy đủ thiết bị thông minh, nội thất chuyên dụng và 5 chương trình CT1-CT5.",
    suitableFor: ["TH", "THCS", "THPT"],
    programsSupported: ["CT1", "CT2", "CT3", "CT4"],
    highlights: [
      "Đầy đủ thiết bị thông minh",
      "Hỗ trợ Robotics cơ bản",
      "Đồng hành 3 năm miễn phí",
      "License phần mềm 50 user",
    ],
    bomCategories: [
      "Cơ sở vật chất phòng (thiết kế + bàn ghế 25-30 chỗ)",
      "Thiết bị kết nối thông minh (smart board)",
      "Nội thất chuyên dụng",
      "Bài học STEM CT1, CT2, CT3",
      "Chủ đề STEM CT4 (Robotics cơ bản)",
      "Tài liệu HS + GV đầy đủ",
      "Tập huấn GV (5 ngày)",
      "Trang trí phòng",
      "Đồng hành 3 năm",
    ],
  },
  {
    id: "advanced",
    name: "Phòng STEM Nâng cao",
    tagline: "Giải pháp toàn diện đẳng cấp quốc tế",
    description:
      "Trang bị cao cấp với đầy đủ Robotics AI, IoT, VR/AR và chương trình NCKH/CLB. Phù hợp trường chuyên, trường quốc tế, trường liên cấp lớn.",
    suitableFor: ["THCS", "THPT", "LC", "THPT_Nghe"],
    programsSupported: ["CT1", "CT2", "CT3", "CT4", "CT5"],
    highlights: [
      "Robotics, AI, IoT đầy đủ",
      "Phòng Lab ảo VR/AR",
      "Đồng hành 5 năm",
      "License không giới hạn",
      "Tham gia thi STEM quốc gia",
    ],
    bomCategories: [
      "Cơ sở vật chất phòng (thiết kế cao cấp + 35-40 chỗ)",
      "Thiết bị kết nối thông minh (smart board lớn + tablet)",
      "Nội thất chuyên dụng cao cấp",
      "Bài học STEM CT1, CT2, CT3 đầy đủ",
      "Chủ đề STEM CT4 (Robotics + AI + IoT)",
      "Chủ đề STEM CT5 (NCKH + CLB)",
      "Tài liệu HS + GV đa phương tiện",
      "Tập huấn GV (10 ngày + GV cốt cán)",
      "Trang trí phòng cao cấp",
      "Đồng hành 5 năm + bảo trì định kỳ",
      "Hệ sinh thái kỳ thi STEM",
    ],
  },
];
