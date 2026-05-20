import type { EventItem } from "./types";

export const events: EventItem[] = [
  {
    id: "ev1",
    title: "Hội thảo STEM Quốc gia 2026 — Hà Nội",
    type: "Hội thảo",
    startDate: "2026-06-20",
    endDate: "2026-06-21",
    location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
    online: false,
    registerUrl: "/contact",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    description:
      "Sự kiện giáo dục STEM lớn nhất năm 2026, quy tụ hơn 500 đại biểu gồm hiệu trưởng, GV STEM và chuyên gia chính sách từ 63 tỉnh thành.",
  },
  {
    id: "ev2",
    title: "Webinar: Triển khai CT4 Robotics tại THCS — Kinh nghiệm thực tiễn",
    type: "Webinar",
    startDate: "2026-06-05",
    location: "Online (Zoom)",
    online: true,
    registerUrl: "/contact",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
    description:
      "Chia sẻ kinh nghiệm thực tế từ 5 trường THCS đã triển khai CT4 Robotics thành công trong năm học 2025-2026.",
  },
  {
    id: "ev3",
    title: "Tập huấn GV STEM khu vực miền Trung — Đà Nẵng",
    type: "Tập huấn",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    location: "Khách sạn Pullman Đà Nẵng",
    online: false,
    registerUrl: "/contact",
    thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    description:
      "3 ngày tập huấn chuyên sâu cho GV bộ môn về phương pháp giảng dạy STEM, sử dụng học liệu CT1-CT3 và vận hành phòng STEM.",
  },
  {
    id: "ev4",
    title: "Ngày hội STEM TP.HCM — Khám phá thế giới STEM",
    type: "Ngày hội STEM",
    startDate: "2026-05-24",
    endDate: "2026-05-25",
    location: "Công viên Phần mềm Quang Trung, TP.HCM",
    online: false,
    registerUrl: "/contact",
    thumbnail: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80",
    description:
      "Ngày hội STEM với hơn 200 gian hàng trải nghiệm, cuộc thi robotics mini cho HS từ 8-18 tuổi, triển lãm thiết bị STEM mới nhất.",
  },
  {
    id: "ev5",
    title: "Cuộc thi Robotics Học sinh Toàn quốc VN 2026",
    type: "Ngày hội STEM",
    startDate: "2026-08-15",
    endDate: "2026-08-17",
    location: "Đại học Bách Khoa Hà Nội",
    online: false,
    registerUrl: "/contact",
    thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80",
    description:
      "Cuộc thi Robotics lớn nhất Việt Nam 2026, Geleximco là nhà tài trợ kim cương. 200+ đội thi từ 45 tỉnh thành tranh tài.",
  },
  {
    id: "ev6",
    title: "Webinar: Ra mắt nền tảng Geleximco STEM v2.0",
    type: "Webinar",
    startDate: "2026-04-20",
    location: "Online (YouTube Live)",
    online: true,
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80",
    description:
      "Giới thiệu các tính năng mới của Geleximco STEM Platform v2.0 — AI Buddy, báo cáo tiến độ thời gian thực và tích hợp VnEdu.",
  },
];
