import type { Partner } from "./types";

export const partners: Partner[] = [
  {
    id: "geleximco-stem",
    name: "Geleximco STEM",
    slug: "geleximco-stem",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Geleximco&backgroundColor=990803",
    tagline: "Nền tảng tổng thể giáo dục STEM",
    description:
      "Geleximco STEM là nền tảng tổng thể được phát triển bởi Tập đoàn Geleximco, mang giải pháp giáo dục STEM toàn diện đến với các trường học Việt Nam.",
    role: "Platform owner & Solution integrator",
    contributions: [
      "Nền tảng quản trị tổng thể",
      "Thiết kế phòng STEM (3 tier × 6 bậc học)",
      "Tích hợp nội dung từ đối tác",
      "Đào tạo và đồng hành 5 năm",
      "Liên thông CSDL ngành Giáo dục",
    ],
    website: "https://geleximco-stem.vn",
    contactEmail: "contact@geleximco-stem.vn",
    schoolsServed: 500,
  },
  {
    id: "ebd",
    name: "EBD",
    slug: "ebd",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=EBD&backgroundColor=c8a84e",
    tagline: "NXB Đại học Sư Phạm",
    description:
      "Nhà xuất bản Đại học Sư Phạm Hà Nội là đối tác chiến lược cung cấp học liệu chuẩn cho 5 chương trình STEM CT1-CT5, mapping chuẩn với SGK Bộ GD&ĐT.",
    role: "Content provider — Học liệu STEM",
    contributions: [
      "Học liệu chuẩn cho CT1, CT2, CT3",
      "Mapping với SGK Bộ 'Kết nối tri thức với cuộc sống'",
      "Giáo án + Bài giảng PPTX + Video",
      "Tài liệu bồi dưỡng giáo viên",
      "Đề thi STEM chuẩn",
    ],
    website: "https://nxbdhsp.edu.vn",
    contactEmail: "info@ebd.edu.vn",
    schoolsServed: 320,
  },
  {
    id: "nexta",
    name: "Nexta",
    slug: "nexta",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Nexta&backgroundColor=2e86de",
    tagline: "Thiết bị STEM thông minh",
    description:
      "Nexta cung cấp thiết bị Robotics, AI, IoT và phần mềm lập trình cho các chương trình STEM cấp THCS, THPT, đặc biệt mạnh ở CT4.",
    role: "Hardware & Software provider — Robotics/AI/IoT",
    contributions: [
      "Bộ kit Robotics (mBot, Arduino-based)",
      "Thiết bị AI/IoT (camera, sensor)",
      "Phần mềm lập trình kéo-thả",
      "License phần mềm theo trường",
      "Hỗ trợ kỹ thuật + bảo hành thiết bị",
    ],
    website: "https://nexta.vn",
    contactEmail: "support@nexta.vn",
    schoolsServed: 180,
  },
];
