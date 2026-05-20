export interface LeadershipMember {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
}

export interface Milestone {
  year: number;
  event: string;
  detail?: string;
}

export const leadershipTeam: LeadershipMember[] = [
  {
    name: "TS. Nguyễn Quang Hải",
    role: "Tổng Giám đốc",
    bio: "25 năm kinh nghiệm giáo dục và công nghệ. Nguyên Phó Vụ trưởng Vụ Giáo dục Chính quy, Bộ GD&ĐT.",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=NQH&backgroundColor=990803",
  },
  {
    name: "PGS.TS. Trần Minh Châu",
    role: "Giám đốc Giáo dục",
    bio: "Chuyên gia chương trình GDPT 2018. Chủ biên nhiều bộ tài liệu STEM chuẩn Bộ GD&ĐT.",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=TMC&backgroundColor=c8a84e",
  },
  {
    name: "Lê Văn Dũng",
    role: "Giám đốc Công nghệ",
    bio: "15 năm kinh nghiệm phát triển phần mềm EdTech tại Việt Nam và Đông Nam Á.",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=LVD&backgroundColor=1a6cad",
  },
  {
    name: "Phạm Thị Lan",
    role: "Giám đốc Kinh doanh",
    bio: "10 năm kinh nghiệm phát triển thị trường B2B giáo dục. Xây dựng mạng lưới 500+ trường đối tác.",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=PTL&backgroundColor=990803",
  },
  {
    name: "ThS. Hoàng Anh Tuấn",
    role: "Giám đốc Nội dung",
    bio: "Cựu giáo viên THPT, tác giả 12 bộ tài liệu STEM chuẩn quốc gia, chuyên gia thiết kế chương trình.",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=HAT&backgroundColor=c8a84e",
  },
  {
    name: "Ngô Thị Hương",
    role: "Giám đốc Vận hành",
    bio: "Chuyên gia quản lý dự án giáo dục. Đảm bảo triển khai STEM thành công tại 500+ trường trên toàn quốc.",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=NTH&backgroundColor=1a6cad",
  },
];

export const companyMilestones: Milestone[] = [
  {
    year: 2018,
    event: "Nghiên cứu & Khởi động",
    detail: "Geleximco bắt đầu nghiên cứu mô hình giáo dục STEM Việt Nam và quốc tế, tham vấn chuyên gia Bộ GD&ĐT.",
  },
  {
    year: 2020,
    event: "Ra mắt Pilot",
    detail: "Triển khai thí điểm tại 20 trường ở Hà Nội, TP.HCM, Đà Nẵng. Thu phản hồi từ 500+ giáo viên để điều chỉnh chương trình.",
  },
  {
    year: 2021,
    event: "Mở rộng toàn quốc",
    detail: "Phủ sóng 20/63 tỉnh thành. Ký kết hợp tác chiến lược với EBD (NXB ĐH Sư Phạm) và Nexta Technologies.",
  },
  {
    year: 2022,
    event: "Chuẩn hóa 5 chương trình",
    detail: "Hoàn thiện CT1-CT5 mapping SGK 'Kết nối tri thức với cuộc sống'. Ra mắt hệ thống quản lý STEM v1.0.",
  },
  {
    year: 2023,
    event: "Đạt mốc 300 trường",
    detail: "Hơn 300 trường triển khai thành công. Nhận giải thưởng Sản phẩm EdTech xuất sắc 2023.",
  },
  {
    year: 2024,
    event: "Geleximco STEM Platform",
    detail: "Ra mắt nền tảng quản lý toàn diện — kết nối NCC, Nhà trường, GV, HS và cơ quan quản lý giáo dục.",
  },
];
