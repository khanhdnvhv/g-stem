import type { StemProgramMeta, StemProgram, StemPackageTier } from "./types";

/* ================================================================ */
/*  CONSTANTS — 5 chương trình, 3 gói, cấp học, bộ môn               */
/*  Nguồn: STEM-Transformation-Plan.md §3.1, §3.2                    */
/* ================================================================ */

export const STEM_PROGRAMS: Record<StemProgram, StemProgramMeta> = {
  CT1: {
    code: "CT1",
    name: "STEM Tích hợp nội môn",
    shortName: "Tích hợp nội môn",
    description:
      "Giảng dạy từng môn theo hướng thực tiễn, ứng dụng sáng tạo. Chỉ chạm đến môn học của GV, phù hợp mọi bộ môn.",
    color: "#64748b",
    supportedGrades: ["Mầm non", "Tiểu học", "THCS", "THPT", "THPT Nghề"],
    supportedSubjects: ["Toán", "Lý", "Hóa", "Sinh", "Tin", "Công nghệ", "Tiếng Việt", "Khoa học"],
  },
  CT2: {
    code: "CT2",
    name: "STEM Liên môn",
    shortName: "Liên môn",
    description:
      "Vận dụng kiến thức liên môn để giải quyết vấn đề thực tiễn, vận dụng một môn làm chủ đề STEM.",
    color: "#0891b2",
    supportedGrades: ["THCS", "THPT"],
    supportedSubjects: ["Toán", "Lý", "Hóa", "Sinh", "Tin", "Công nghệ"],
  },
  CT3: {
    code: "CT3",
    name: "STEM Đổi mới sáng tạo",
    shortName: "Đổi mới sáng tạo",
    description:
      "Hoạt động sáng tạo, làm sản phẩm cụ thể, vận dụng giải pháp từ kết quả STEM. Câu lạc bộ, ngoại khóa.",
    color: "#7c3aed",
    supportedGrades: ["Tiểu học", "THCS", "THPT"],
    supportedSubjects: ["CLB Sáng tạo", "Ngoại khóa", "Làm sản phẩm"],
  },
  CT4: {
    code: "CT4",
    name: "STEM Robotic · AI · Trải nghiệm",
    shortName: "Robotic / AI",
    description:
      "STEM định hướng đổi mới sáng tạo: vận dụng kiến thức, kỹ năng, công nghệ để giải quyết bài toán cụ thể (Robotic, AI, Trải nghiệm).",
    color: "#dc2626",
    supportedGrades: ["THCS", "THPT", "THPT Nghề"],
    supportedSubjects: ["Robotic", "AI", "Lập trình", "IoT"],
  },
  CT5: {
    code: "CT5",
    name: "STEM Nghiên cứu khoa học",
    shortName: "Nghiên cứu khoa học",
    description:
      "Tập trung nghiên cứu, có kế hoạch nghiên cứu độc lập, định hướng học sinh 5 năm, có kết quả có thể đăng bài báo khoa học.",
    color: "#059669",
    supportedGrades: ["THCS", "THPT"],
    supportedSubjects: ["NCKH", "Dự án Nghiên cứu"],
  },
};

export const STEM_PROGRAM_LIST = Object.values(STEM_PROGRAMS);

export interface StemTierMeta {
  tier: StemPackageTier;
  name: string;
  shortName: string;
  description: string;
  color: string;
  levelOfService: string;
  icon: string;
}
export const STEM_TIERS: Record<StemPackageTier, StemTierMeta> = {
  minimum: {
    tier: "minimum",
    name: "STEM Tối thiểu",
    shortName: "Tối thiểu",
    description: "Bộ dụng cụ STEM tại nhà/lớp — đáp ứng CT1 sơ cấp.",
    color: "#94a3b8",
    levelOfService: "CT1 sơ cấp",
    icon: "Boxes",
  },
  basic: {
    tier: "basic",
    name: "STEM Cơ bản",
    shortName: "Cơ bản",
    description: "Phòng Lab STEM 1, Robotic cơ bản — đáp ứng CT1–CT2. Trường quốc gia.",
    color: "#2e86de",
    levelOfService: "Trường quốc gia",
    icon: "FlaskConical",
  },
  advanced: {
    tier: "advanced",
    name: "STEM Nâng cao",
    shortName: "Nâng cao",
    description: "AI, IoT, Robotic 5 năm — đáp ứng CT3, CT4, CT5. Trường trọng điểm / chất lượng cao.",
    color: "#c8a84e",
    levelOfService: "Trọng điểm / CL cao",
    icon: "Cpu",
  },
};
export const STEM_TIER_LIST = Object.values(STEM_TIERS);

export const GRADE_LEVELS = [
  "Mầm non",
  "Tiểu học 1", "Tiểu học 2", "Tiểu học 3", "Tiểu học 4", "Tiểu học 5",
  "THCS 6", "THCS 7", "THCS 8", "THCS 9",
  "THPT 10", "THPT 11", "THPT 12",
  "THPT Nghề",
];

export const SCHOOL_TIERS = ["Mầm non", "Tiểu học", "THCS", "THPT", "THPT Nghề"] as const;

export const SUBJECTS = [
  "Toán", "Ngữ văn", "Tiếng Anh",
  "Lý", "Hóa", "Sinh",
  "Tin học", "Công nghệ",
  "Khoa học Tự nhiên", "Khoa học Xã hội",
  "Lịch sử", "Địa lý", "GDCD",
  "Mỹ thuật", "Âm nhạc", "Thể dục",
  "Robotic", "AI", "Lập trình", "IoT",
  "NCKH", "CLB Sáng tạo",
];

export const FUNDING_SOURCES = ["Ngân sách", "Học phí", "Xã hội hóa"] as const;

/** Các Thông tư Bộ GD&ĐT liên quan — nguồn báo cáo */
export const MINISTRY_REPORT_TEMPLATES = [
  { code: "TT38-2023", name: "Thông tư 38/2023 — Báo cáo thiết bị dạy học" },
  { code: "TT32-2020", name: "Thông tư 32/2020 — Chương trình GDPT tổng thể" },
  { code: "CV1014",    name: "Công văn 1014 — Triển khai giáo dục STEM" },
  { code: "TT26-2020", name: "Thông tư 26/2020 — Đánh giá HS trung học" },
  { code: "BC-STEM-Q", name: "Báo cáo triển khai STEM theo quý" },
];

/** Ảnh STEM thay cho ảnh corporate training cũ */
export const STEM_IMAGES = [
  "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1080&q=80", // robotic class
  "https://images.unsplash.com/photo-1628359355624-855775b5c9c4?auto=format&fit=crop&w=1080&q=80", // kids coding
  "https://images.unsplash.com/photo-1581091877018-dac6a371d50f?auto=format&fit=crop&w=1080&q=80", // science experiment
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1080&q=80", // microscope
  "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&w=1080&q=80", // robotic
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80", // circuit board
  "https://images.unsplash.com/photo-1496439786094-e29d5da23ad2?auto=format&fit=crop&w=1080&q=80", // lab
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1080&q=80", // code
];
