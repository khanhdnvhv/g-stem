import type { Lesson } from "./types";
import { STEM_IMAGES } from "./constants";

/* ================================================================ */
/*  LESSONS — 50 bài giảng theo CT1–CT5                              */
/* ================================================================ */

const lessonTemplates = [
  { program: "CT1", subject: "Toán",     titles: ["Đo đạc trong đời sống", "Hình học quanh ta", "Biểu đồ và thống kê"] },
  { program: "CT1", subject: "Khoa học", titles: ["Chu trình nước", "Sinh vật quanh em", "Nguồn năng lượng tự nhiên"] },
  { program: "CT1", subject: "Công nghệ",titles: ["Lắp ráp đơn giản", "Vật liệu xanh", "Dụng cụ an toàn"] },
  { program: "CT2", subject: "Toán-Lý",  titles: ["Đòn bẩy và công cơ học", "Chuyển động đều", "Mô hình vật lý toán học"] },
  { program: "CT2", subject: "Toán-Hóa", titles: ["Tính toán phản ứng hóa học", "Nồng độ và pha chế", "Hóa học tỷ lệ"] },
  { program: "CT2", subject: "Sinh-Hóa", titles: ["Enzyme và pH", "Hô hấp tế bào", "Phân tích môi trường nước"] },
  { program: "CT3", subject: "Sáng tạo", titles: ["Thiết kế cây xanh thông minh", "Đồ chơi cơ khí tái chế", "Mô hình bảo vệ môi trường"] },
  { program: "CT3", subject: "Ngoại khóa",titles: ["Làm phim ngắn về STEM", "Bảo tàng STEM mini", "CLB Cơ khí sáng tạo"] },
  { program: "CT4", subject: "Robotic",  titles: ["Lập trình robot né vật cản", "Robot line follow", "Cánh tay robot gắp-thả"] },
  { program: "CT4", subject: "AI",       titles: ["Nhận dạng ảnh với Teachable Machine", "Chatbot đơn giản", "Phân loại hoa bằng AI"] },
  { program: "CT4", subject: "IoT",      titles: ["Nhà thông minh Arduino", "Cảm biến nhiệt độ WiFi", "Hệ thống tưới tự động"] },
  { program: "CT5", subject: "NCKH",     titles: ["Đề tài: Lọc nước từ thực vật", "Đề tài: Vật liệu cách nhiệt tái chế", "Đề tài: Giảm tiếng ồn sân trường"] },
];

export const lessons: Lesson[] = [];
let idx = 1;
for (const tpl of lessonTemplates) {
  for (const title of tpl.titles) {
    lessons.push({
      id: `LSN-${String(idx).padStart(4, "0")}`,
      title,
      description: `Bài giảng ${tpl.program} — ${tpl.subject}. Phù hợp học sinh tìm hiểu thực tiễn & ứng dụng.`,
      programCode: tpl.program as Lesson["programCode"],
      gradeLevel: "THCS 8",
      subject: tpl.subject,
      sgkMapping:
        tpl.program === "CT1" || tpl.program === "CT2"
          ? "SGK Kết nối Tri thức — Chương " + ((idx % 6) + 1)
          : undefined,
      durationMinutes: 45 + (idx % 3) * 15,
      resourceUrls: [`/resources/${tpl.program}/lesson-${idx}.pdf`],
      thumbnail: STEM_IMAGES[idx % STEM_IMAGES.length],
      createdBy: "U-SUP-02",
      createdAt: `2025-${String((idx % 12) + 1).padStart(2, "0")}-10T00:00:00Z`,
    });
    idx++;
    if (lessons.length >= 50) break;
  }
  if (lessons.length >= 50) break;
}
