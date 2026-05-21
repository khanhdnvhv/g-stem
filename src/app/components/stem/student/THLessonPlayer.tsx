import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, Volume2 } from "lucide-react";

/* ─── CT meta ────────────────────────────────────────────────────────────── */
const CT_META = {
  CT1: { label:"CT1 – Tích hợp",   color:"#990803", bg:"#FFF8F8" },
  CT2: { label:"CT2 – Liên môn",   color:"#2563eb", bg:"#EFF6FF" },
  CT3: { label:"CT3 – Tăng cường", color:"#7c3aed", bg:"#F5F3FF" },
  CT4: { label:"CT4 – Robotics",   color:"#f59e0b", bg:"#FFFBEB" },
  CT5: { label:"CT5 – NCKH",       color:"#16a34a", bg:"#F0FDF4" },
} as const;
type CTKey = keyof typeof CT_META;

type LessonStatus = "completed" | "current" | "locked";

interface Lesson {
  id: number; title: string; duration: string; status: LessonStatus;
  hasTheory: boolean; hasExercise: boolean; hasSubmit: boolean;
}

interface CourseDetail {
  id: number; ct: CTKey; name: string; subject: string;
  teacher: string; emoji: string; desc: string;
  lessonsTotal: number; lessonsDone: number;
  status: "inprogress" | "completed";
  lessons: Lesson[];
}

/* ─── Course data ────────────────────────────────────────────────────────── */
const COURSE_DETAILS: Record<number, CourseDetail> = {
  1: {
    id:1, ct:"CT1", name:"Toán Tư Duy STEM", subject:"Toán học", teacher:"Cô Lan Anh",
    emoji:"🔢", lessonsTotal:24, lessonsDone:18, status:"inprogress",
    desc:"Phát triển tư duy logic qua các bài toán thực tiễn theo phương pháp STEM.",
    lessons: [
      { id:1,  title:"Giới thiệu Toán STEM",           duration:"10 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:2,  title:"Đếm và phân loại đồ vật",        duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:3,  title:"Phép cộng có nhớ",               duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:4,  title:"Kiểm tra bài 1–3",               duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:5,  title:"Phép trừ trong phạm vi 100",     duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:6,  title:"Thực hành: Đo chiều dài",        duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:7,  title:"Bảng cửu chương 2–5",            duration:"15 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:8,  title:"Kiểm tra giữa khoá",             duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:9,  title:"Hình học phẳng cơ bản",          duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:10, title:"Vẽ và đo các hình",              duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:11, title:"Bảng cửu chương 6–9",            duration:"15 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:12, title:"Kiểm tra bài 9–11",              duration:"10 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:13, title:"Phép nhân có nhớ — Lý thuyết",  duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:14, title:"Phép nhân có nhớ — Luyện tập",  duration:"25 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:15, title:"Phép chia có dư",                duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:16, title:"Bài toán có lời văn",            duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:17, title:"Ôn tập học kỳ",                  duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:18, title:"Kiểm tra học kỳ 1",              duration:"20 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:19, title:"Phép nhân có nhớ (nâng cao)",   duration:"25 phút", status:"current",   hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:20, title:"Thực hành: Tính diện tích",      duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:21, title:"Phân số cơ bản",                 duration:"20 phút", status:"locked",    hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:22, title:"Cộng trừ phân số",               duration:"20 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:23, title:"Bài toán STEM thực tế",          duration:"40 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:24, title:"Kiểm tra cuối khoá",             duration:"20 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
    ],
  },
  2: {
    id:2, ct:"CT1", name:"Tiếng Việt STEM", subject:"Ngữ văn", teacher:"Cô Thu Hoa",
    emoji:"📖", lessonsTotal:20, lessonsDone:18, status:"inprogress",
    desc:"Phát triển kỹ năng đọc hiểu, sáng tạo văn bản theo phương pháp STEM.",
    lessons: [
      { id:1,  title:"Giới thiệu chương trình",        duration:"10 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:2,  title:"Đọc hiểu văn bản khoa học",     duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:3,  title:"Từ vựng chủ đề STEM",           duration:"15 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:4,  title:"Viết đoạn mô tả thí nghiệm",   duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:5,  title:"Kiểm tra bài 1–4",               duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:6,  title:"Đọc hiểu: Nhà khoa học nhí",   duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:7,  title:"Kể lại thí nghiệm đã làm",     duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:true  },
      { id:8,  title:"Viết báo cáo ngắn",              duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:9,  title:"Từ ghép và từ láy",              duration:"15 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:10, title:"Kiểm tra giữa khoá",             duration:"20 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:11, title:"Câu kể — Câu hỏi",              duration:"15 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:12, title:"Viết sơ đồ tư duy",             duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:true  },
      { id:13, title:"Đọc hiểu: Nước và Sự sống",    duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:14, title:"Tả cây cối theo STEM",          duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:15, title:"Luyện đọc diễn cảm",            duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:16, title:"Kiểm tra bài 11–15",            duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:17, title:"Ôn tập: Đọc & Viết STEM",      duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:18, title:"Kiểm tra học kỳ 1",             duration:"20 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:19, title:"Viết bài văn STEM hoàn chỉnh", duration:"35 phút", status:"current",   hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:20, title:"Kiểm tra cuối khoá",            duration:"20 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
    ],
  },
  7: {
    id:7, ct:"CT3", name:"Lập Trình Scratch", subject:"Sáng tạo số", teacher:"Thầy Minh Đức",
    emoji:"💻", lessonsTotal:20, lessonsDone:8, status:"inprogress",
    desc:"Học lập trình trực quan qua Scratch, xây dựng trò chơi và hoạt hình tương tác.",
    lessons: [
      { id:1,  title:"Giới thiệu Scratch",             duration:"10 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:2,  title:"Kéo thả khối lệnh đầu tiên",    duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:3,  title:"Sprite và Backdrop",             duration:"15 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:4,  title:"Sự kiện (Events)",               duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:5,  title:"Chuyển động cơ bản",             duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:6,  title:"Âm thanh và Hiệu ứng",          duration:"15 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:7,  title:"Kiểm tra bài 1–6",              duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:8,  title:"Lặp (Loops) — Lý thuyết",       duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:9,  title:"Vòng lặp cơ bản — Thực hành",  duration:"30 phút", status:"current",   hasTheory:false, hasExercise:true,  hasSubmit:true  },
      { id:10, title:"Điều kiện (If/Else)",            duration:"20 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:11, title:"Biến (Variables)",               duration:"20 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:12, title:"Dự án: Trò chơi đơn giản",      duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:13, title:"Kiểm tra giữa khoá",             duration:"15 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:14, title:"Clone và Nhân vật phụ",         duration:"25 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:15, title:"Phát thanh (Broadcast)",        duration:"20 phút", status:"locked",    hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:16, title:"Dự án: Hoạt hình có lời",       duration:"50 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:17, title:"Kiểm tra bài 13–16",            duration:"15 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:18, title:"Tích hợp STEM: Mô phỏng",      duration:"40 phút", status:"locked",    hasTheory:true,  hasExercise:false, hasSubmit:true  },
      { id:19, title:"Ôn tập & Trình bày sản phẩm",  duration:"30 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:20, title:"Kiểm tra cuối khoá",             duration:"20 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
    ],
  },

  /* ══════ THCS ══════ */
  101: {
    id:101, ct:"CT1", name:"Toán STEM – Đại số", subject:"Toán học", teacher:"Cô Ngọc Hà",
    emoji:"🔢", lessonsTotal:32, lessonsDone:22, status:"inprogress",
    desc:"Đại số lớp 8: đa thức, phân thức, phương trình bậc hai và hàm số.",
    lessons: [
      { id:1,  title:"Ôn tập đại số lớp 7",                    duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:2,  title:"Đơn thức và đa thức",                    duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:3,  title:"Cộng và trừ đa thức",                    duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:4,  title:"Kiểm tra bài 1–3",                       duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:5,  title:"Nhân đơn thức với đa thức",              duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:6,  title:"Nhân đa thức với đa thức",               duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:7,  title:"Hằng đẳng thức đáng nhớ (nhóm 1)",      duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:8,  title:"Kiểm tra giữa khoá",                     duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:9,  title:"Hằng đẳng thức đáng nhớ (nhóm 2)",      duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:10, title:"Phân tích nhân tử: đặt nhân tử chung",  duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:11, title:"Phân tích nhân tử: dùng hằng đẳng thức",duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:12, title:"Kiểm tra bài 9–11",                      duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:13, title:"Phân thức đại số",                       duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:14, title:"Rút gọn và cộng trừ phân thức",         duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:15, title:"Nhân và chia phân thức",                duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:16, title:"Bài toán thực tế: phân thức",           duration:"35 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:17, title:"Ôn tập học kỳ 1",                        duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:18, title:"Kiểm tra học kỳ 1",                      duration:"45 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:19, title:"Phương trình bậc hai – Lý thuyết",      duration:"30 phút", status:"current",   hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:20, title:"Phương trình bậc hai – Luyện tập",      duration:"35 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:21, title:"Công thức nghiệm tổng quát (Δ)",        duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:22, title:"Bài tập tổng hợp phương trình bậc hai", duration:"40 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:23, title:"Ứng dụng STEM: mô hình hóa thực tế",   duration:"45 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:24, title:"Kiểm tra chương phương trình",           duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:25, title:"Hàm số bậc hai y = ax²",                duration:"25 phút", status:"locked",    hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:26, title:"Đồ thị parabol",                         duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:27, title:"Thực hành: vẽ đồ thị bằng GeoGebra",   duration:"40 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:28, title:"Hệ phương trình bậc nhất hai ẩn",       duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:29, title:"Giải hệ PT – phương pháp thế",          duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:30, title:"Dự án STEM: mô hình toán học",          duration:"60 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:31, title:"Ôn tập cuối năm",                        duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:32, title:"Kiểm tra cuối kỳ",                       duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
    ],
  },
  107: {
    id:107, ct:"CT3", name:"Lập Trình Python", subject:"Tin học", teacher:"Thầy Minh Đức",
    emoji:"💻", lessonsTotal:20, lessonsDone:8, status:"inprogress",
    desc:"Python từ cơ bản đến ứng dụng: biến, vòng lặp, hàm, list và dự án thực tế.",
    lessons: [
      { id:1,  title:"Giới thiệu Python & cài đặt môi trường",duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:2,  title:"Biến, kiểu dữ liệu và phép toán",       duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:3,  title:"Nhập xuất: input() và print()",          duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:4,  title:"Kiểm tra bài 1–3",                      duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:5,  title:"Cấu trúc if / elif / else",              duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:6,  title:"Vòng lặp for và range()",               duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:7,  title:"Vòng lặp while",                        duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:8,  title:"Kiểm tra giữa khoá",                    duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:9,  title:"Hàm (def) và tham số",                  duration:"30 phút", status:"current",   hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:10, title:"Danh sách (list) và thao tác",          duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:11, title:"Dictionary và tuple",                    duration:"25 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:12, title:"Dự án: máy tính bỏ túi",               duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:13, title:"Xử lý chuỗi (string)",                  duration:"25 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:14, title:"Đọc/ghi file văn bản",                  duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:15, title:"Module và thư viện chuẩn",              duration:"25 phút", status:"locked",    hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:16, title:"Dự án: phân tích dữ liệu đơn giản",    duration:"60 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:17, title:"Nhập môn lập trình hướng đối tượng",   duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:18, title:"Tích hợp STEM: mô phỏng dữ liệu",     duration:"45 phút", status:"locked",    hasTheory:true,  hasExercise:false, hasSubmit:true  },
      { id:19, title:"Ôn tập và code review",                 duration:"30 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:20, title:"Kiểm tra cuối khoá",                    duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
    ],
  },
  109: {
    id:109, ct:"CT4", name:"Robotics Nâng Cao", subject:"Robotics", teacher:"Thầy Hoàng",
    emoji:"🤖", lessonsTotal:18, lessonsDone:7, status:"inprogress",
    desc:"Arduino, cảm biến, robot tự động và dự án IoT thực tế lớp 8.",
    lessons: [
      { id:1,  title:"Ôn tập Robotics cơ bản",               duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:2,  title:"Arduino Uno: cấu trúc và lập trình",   duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:3,  title:"LED, buzzer và digital output",         duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:4,  title:"Cảm biến siêu âm HC-SR04",             duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:5,  title:"Kiểm tra bài 1–4",                     duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:6,  title:"Động cơ DC và điều khiển tốc độ",      duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:7,  title:"Dự án: robot né vật cản",              duration:"60 phút", status:"completed", hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:8,  title:"Cảm biến ánh sáng và màu sắc",         duration:"30 phút", status:"current",   hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:9,  title:"PID controller cơ bản",                duration:"35 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:10, title:"Robot dò đường (line follower)",       duration:"60 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:11, title:"Giao tiếp không dây Bluetooth HC-05",  duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:12, title:"Điều khiển robot qua điện thoại",      duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:13, title:"Nhập môn IoT với ESP8266",             duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:14, title:"Gửi dữ liệu cảm biến lên Cloud",      duration:"40 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:15, title:"Dashboard IoT hiển thị dữ liệu",      duration:"35 phút", status:"locked",    hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:16, title:"Dự án: trạm quan trắc môi trường",    duration:"90 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:17, title:"Thuyết trình và bảo vệ dự án",        duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:18, title:"Kiểm tra cuối khoá",                   duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
    ],
  },
};

function makeFallback(id: number): CourseDetail | null {
  const base: Record<number, Omit<CourseDetail,"lessons">> = {
    3:  { id:3,  ct:"CT1", name:"Khoa Học Tự Nhiên",      subject:"Khoa học",         teacher:"Thầy Quang",    emoji:"🔬", lessonsTotal:18, lessonsDone:11, status:"inprogress", desc:"Khám phá thế giới tự nhiên qua thí nghiệm." },
    4:  { id:4,  ct:"CT1", name:"Tiếng Anh STEM",         subject:"Ngoại ngữ",        teacher:"Cô Thu Trang",  emoji:"🌐", lessonsTotal:16, lessonsDone:16, status:"completed",  desc:"Học tiếng Anh qua các chủ đề khoa học." },
    8:  { id:8,  ct:"CT3", name:"Thiết Kế & Chế Tạo",     subject:"Đổi mới sáng tạo", teacher:"Cô Hải Yến",   emoji:"✂️", lessonsTotal:12, lessonsDone:1,  status:"inprogress", desc:"Học thiết kế và chế tạo sản phẩm thực tế." },
    9:  { id:9,  ct:"CT4", name:"Robotics Nhí",           subject:"Robotics",         teacher:"Thầy Hoàng",    emoji:"🤖", lessonsTotal:15, lessonsDone:8,  status:"inprogress", desc:"Lắp ráp và lập trình robot cơ bản." },
    102:{ id:102,ct:"CT1", name:"Vật Lý STEM",            subject:"Vật lý",           teacher:"Thầy Quang",    emoji:"⚡", lessonsTotal:28, lessonsDone:18, status:"inprogress", desc:"Điện học, quang học và cơ học ứng dụng STEM lớp 8." },
    103:{ id:103,ct:"CT1", name:"Hóa Học STEM",           subject:"Hóa học",          teacher:"Thầy Trung Nam",emoji:"🧪", lessonsTotal:24, lessonsDone:20, status:"inprogress", desc:"Phản ứng hóa học, axit–bazơ và kim loại trong thực nghiệm STEM." },
    104:{ id:104,ct:"CT1", name:"Sinh Học STEM",          subject:"Sinh học",         teacher:"Cô Phương Mai", emoji:"🌿", lessonsTotal:20, lessonsDone:14, status:"inprogress", desc:"Di truyền học và sinh thái học gắn với thực tiễn." },
    105:{ id:105,ct:"CT1", name:"Ngữ Văn STEM",           subject:"Ngữ văn",          teacher:"Cô Lan Anh",    emoji:"📖", lessonsTotal:22, lessonsDone:19, status:"inprogress", desc:"Văn nghị luận và kỹ năng viết báo cáo khoa học." },
    106:{ id:106,ct:"CT1", name:"Tiếng Anh STEM",         subject:"Ngoại ngữ",        teacher:"Cô Thu Trang",  emoji:"🌐", lessonsTotal:26, lessonsDone:24, status:"inprogress", desc:"Reading comprehension và communication trong bối cảnh STEM." },
    108:{ id:108,ct:"CT3", name:"Thiết Kế 3D & In ấn",   subject:"Sáng tạo số",      teacher:"Cô Hải Yến",   emoji:"🎨", lessonsTotal:16, lessonsDone:5,  status:"inprogress", desc:"Thiết kế mô hình 3D bằng Fusion 360 và in prototype." },
    110:{ id:110,ct:"CT4", name:"AI & Machine Learning",  subject:"Tin học",          teacher:"Thầy Tuấn",     emoji:"🧠", lessonsTotal:15, lessonsDone:4,  status:"inprogress", desc:"Nhập môn AI: thuật toán học máy và ứng dụng thực tế." },
  };
  const b = base[id];
  if (!b) return null;
  const lessons: Lesson[] = Array.from({ length: b.lessonsTotal }, (_, i) => ({
    id: i + 1,
    title: i % 3 === 0 ? `Lý thuyết bài ${Math.floor(i/3)+1}` : i % 3 === 1 ? `Luyện tập bài ${Math.floor(i/3)+1}` : `Thực hành bài ${Math.floor(i/3)+1}`,
    duration: i % 3 === 2 ? "30 phút" : "20 phút",
    status: i < b.lessonsDone - 1 ? "completed" : i === b.lessonsDone - 1 ? "current" : "locked",
    hasTheory: i % 3 === 0, hasExercise: i % 3 === 1, hasSubmit: i % 3 === 2,
  }));
  return { ...b, lessons };
}

/* ─── Theory key points ──────────────────────────────────────────────────── */
const THEORY_POINTS: Record<string, string[]> = {
  // Tiểu học
  "Toán Tư":  ["Khái niệm và định nghĩa toán học", "Ví dụ minh họa bằng đồ vật thực tế", "Quy tắc và phương pháp giải", "Bài tập vận dụng vào cuộc sống"],
  "Tiếng":    ["Đọc hiểu văn bản chủ đề STEM", "Từ vựng khoa học quan trọng", "Kỹ năng viết mô tả và báo cáo", "Luyện đọc diễn cảm và kể chuyện"],
  "Scratch":  ["Giới thiệu khái niệm lập trình", "Giao diện và các khối lệnh cơ bản", "Xây dựng chương trình từng bước", "Kiểm tra và sửa lỗi chương trình"],
  // THCS
  "Đại số":   ["Phân tích bài toán và xác định ẩn số", "Lập phương trình / hệ phương trình", "Giải và biện luận nghiệm (tính Δ)", "Kiểm tra nghiệm và ứng dụng thực tế"],
  "Vật Lý":   ["Định luật và công thức vật lý", "Phân tích hiện tượng qua thực nghiệm", "Đại lượng, đơn vị và phép đo", "Giải bài tập định lượng STEM"],
  "Hóa Học":  ["Cấu trúc nguyên tử và liên kết hóa học", "Lập phương trình phản ứng", "Cân bằng phương trình theo mol", "Tính toán và ứng dụng trong thực tế"],
  "Sinh Học": ["Cơ chế và quá trình sinh học", "Phân tích cấu trúc – chức năng", "Chu kỳ sinh học và di truyền", "Ứng dụng trong y học và nông nghiệp"],
  "Python":   ["Cú pháp và kiểu dữ liệu Python", "Cấu trúc điều kiện và vòng lặp", "Định nghĩa hàm và tái sử dụng code", "Debug và kiểm thử chương trình"],
  "Robotics": ["Cấu trúc phần cứng và cảm biến", "Lập trình Arduino điều khiển", "Tích hợp cảm biến vào hệ thống", "Kiểm thử và tối ưu hoạt động robot"],
  "AI":       ["Khái niệm trí tuệ nhân tạo và ML", "Thu thập và tiền xử lý dữ liệu", "Huấn luyện mô hình phân loại", "Đánh giá kết quả và cải thiện mô hình"],
  "default":  ["Khái niệm và lý thuyết cốt lõi", "Phân tích và lập luận logic", "Ứng dụng vào bài toán thực tế STEM", "Tổng kết và mở rộng kiến thức"],
};

function getPoints(courseName: string): string[] {
  for (const key of Object.keys(THEORY_POINTS)) {
    if (courseName.includes(key)) return THEORY_POINTS[key];
  }
  return THEORY_POINTS["default"];
}

/* ─── Exercise content ───────────────────────────────────────────────────── */
type Question = { q: string; options: string[]; correct: number };

const EXERCISE_DESC: Record<string, string> = {
  // Tiểu học
  "CT1-1":   "Vận dụng kiến thức về phép nhân có nhớ để giải các bài toán dưới đây. Mỗi câu có 1 đáp án đúng.",
  "CT1-2":   "Đọc kỹ và chọn đáp án đúng về kiến thức Tiếng Việt STEM. Mỗi câu có 1 đáp án đúng.",
  "CT3-7":   "Kiểm tra kiến thức lập trình Scratch. Mỗi câu có 1 đáp án đúng.",
  // THCS
  "CT1-101": "Vận dụng lý thuyết phương trình bậc hai để giải các bài tập dưới đây. Trình bày rõ bước tính Δ và kết luận nghiệm.",
  "CT3-107": "Kiểm tra kiến thức lập trình Python cơ bản. Chọn đáp án đúng cho mỗi câu.",
  "CT4-109": "Kiểm tra hiểu biết về Arduino, cảm biến và lập trình robot. Mỗi câu có 1 đáp án đúng.",
  "default": "Trả lời các câu hỏi để kiểm tra mức độ hiểu bài. Chọn 1 đáp án đúng cho mỗi câu.",
};

const EXERCISES: Record<string, Question[]> = {
  // Tiểu học
  "CT1-1": [
    { q:"Kết quả của phép tính 47 × 8 là bao nhiêu?", options:["376", "368", "384", "356"], correct:0 },
    { q:"Để tính 35 × 6, em tách 35 thành 30 + 5, rồi tính: 30 × 6 = 180 và 5 × 6 = ?", options:["20", "25", "30", "35"], correct:2 },
    { q:"Phép nhân nào cho kết quả lớn nhất?", options:["12 × 9 = 108", "15 × 7 = 105", "18 × 5 = 90", "11 × 9 = 99"], correct:0 },
  ],
  "CT1-2": [
    { q:"Trong câu \"Con mèo chạy nhanh\", từ nào là động từ?", options:["Con", "Mèo", "Chạy", "Nhanh"], correct:2 },
    { q:"Từ ghép nào dưới đây được tạo từ hai từ cùng nghĩa?", options:["Hoa quả", "Bàn ghế", "Đất nước", "Sông núi"], correct:2 },
    { q:"Câu hỏi dùng dấu gì ở cuối?", options:["Dấu chấm .", "Dấu chấm hỏi ?", "Dấu chấm than !", "Dấu phẩy ,"], correct:1 },
  ],
  "CT3-7": [
    { q:"Trong Scratch, khối lệnh nào dùng để di chuyển nhân vật?", options:["Say [Hello]", "Move [10] steps", "Play sound", "If <> then"], correct:1 },
    { q:"Vòng lặp \"repeat 10\" sẽ thực hiện bao nhiêu lần?", options:["1 lần", "5 lần", "10 lần", "Mãi mãi"], correct:2 },
    { q:"Sự kiện nào được dùng để bắt đầu chương trình Scratch?", options:["When sprite clicked", "When [space] key pressed", "When green flag clicked", "When backdrop switches"], correct:2 },
  ],
  // THCS
  "CT1-101": [
    { q:"Phương trình x² – 5x + 6 = 0 có nghiệm là:", options:["x = 2 hoặc x = 3", "x = –2 hoặc x = –3", "x = 1 hoặc x = 6", "Vô nghiệm"], correct:0 },
    { q:"Δ (delta) của phương trình 2x² – 4x + 3 = 0 bằng:", options:["Δ = –8", "Δ = 8", "Δ = –16", "Δ = 4"], correct:0 },
    { q:"Phương trình bậc hai ax² + bx + c = 0 (a ≠ 0) có 2 nghiệm phân biệt khi:", options:["Δ > 0", "Δ = 0", "Δ < 0", "a > 0"], correct:0 },
  ],
  "CT3-107": [
    { q:"Trong Python, để tạo danh sách (list) ta dùng cú pháp nào?", options:["(1, 2, 3)", "[1, 2, 3]", "{1, 2, 3}", "<1, 2, 3>"], correct:1 },
    { q:"Vòng lặp nào dùng khi biết trước số lần lặp?", options:["while", "for", "do-while", "repeat"], correct:1 },
    { q:"Hàm input() trong Python dùng để:", options:["Hiển thị kết quả", "Nhận dữ liệu từ bàn phím", "Tính toán số học", "Lưu file"], correct:1 },
  ],
  "CT4-109": [
    { q:"Cảm biến siêu âm HC-SR04 trong robot dùng để:", options:["Đo nhiệt độ", "Phát hiện khoảng cách vật cản", "Nhận dạng màu sắc", "Đo tốc độ gió"], correct:1 },
    { q:"Ngôn ngữ lập trình phổ biến nhất để lập trình Arduino là:", options:["Python", "Java", "C/C++", "Scratch"], correct:2 },
    { q:"Hàm analogRead() trong Arduino dùng để:", options:["Đọc giá trị số từ pin digital", "Đọc giá trị tương tự (0–1023) từ pin analog", "Ghi giá trị ra màn hình", "Điều khiển động cơ"], correct:1 },
  ],
  "default": [
    { q:"Điều quan trọng nhất khi học theo phương pháp STEM là?", options:["Học thuộc lòng lý thuyết", "Chỉ làm bài tập", "Kết nối kiến thức với thực tế", "Học riêng từng môn"], correct:2 },
    { q:"Trong bài học hôm nay, em đã được học về?", options:["Lý thuyết mới", "Luyện tập kỹ năng", "Thực hành sáng tạo", "Tất cả các trên"], correct:3 },
    { q:"Để hiểu bài tốt hơn, em nên làm gì?", options:["Đọc lại lý thuyết", "Làm thêm bài tập", "Hỏi giáo viên khi chưa hiểu", "Tất cả đều đúng"], correct:3 },
  ],
};

function getExercise(ct: CTKey, courseId: number): { desc: string; questions: Question[] } {
  const key = `${ct}-${courseId}`;
  return {
    desc: EXERCISE_DESC[key] ?? EXERCISE_DESC["default"],
    questions: EXERCISES[key] ?? EXERCISES["default"],
  };
}

/* ─── Submit task descriptions ───────────────────────────────────────────── */
const SUBMIT_TASK: Record<string, { title: string; desc: string; steps: string[] }> = {
  // Tiểu học
  "CT1-1": {
    title: "Bảng cửu chương sáng tạo",
    desc: "Dùng bút màu vẽ bảng cửu chương (từ 2 đến 9) trên giấy A4 với cách trình bày sáng tạo, dễ nhìn, dễ nhớ.",
    steps: ["Chuẩn bị giấy A4 và bút màu", "Vẽ bảng cửu chương từ 2 đến 9", "Trang trí sáng tạo theo ý thích", "Chụp ảnh rõ nét và nộp lên"],
  },
  "CT1-2": {
    title: "Đoạn văn mô tả thí nghiệm",
    desc: "Viết một đoạn văn ngắn (4–6 câu) mô tả một thí nghiệm khoa học đơn giản em đã làm hoặc em thích.",
    steps: ["Chọn một thí nghiệm em đã thấy hoặc làm", "Viết 4–6 câu mô tả: thí nghiệm là gì, cần gì, kết quả ra sao", "Viết tay rõ ràng trên giấy trắng", "Chụp ảnh và nộp lên"],
  },
  "CT3-7": {
    title: "Chương trình Scratch của em",
    desc: "Tạo một chương trình Scratch đơn giản có nhân vật di chuyển theo vòng lặp (sử dụng khối repeat).",
    steps: ["Mở Scratch và tạo project mới", "Thêm nhân vật và viết code dùng khối repeat", "Chạy thử để kiểm tra", "Chụp màn hình chương trình đang chạy và nộp lên"],
  },
  // THCS
  "CT1-101": {
    title: "Bài tập giải phương trình bậc hai",
    desc: "Giải 3 phương trình bậc hai sau và trình bày đầy đủ các bước: lập Δ, xét nghiệm, kết luận.",
    steps: ["Giải 3 phương trình trong phiếu bài tập đính kèm", "Trình bày rõ ràng: bước lập Δ → xét dấu → tính nghiệm", "Kiểm tra lại nghiệm bằng cách thế vào phương trình gốc", "Chụp ảnh bài làm rõ nét và nộp lên"],
  },
  "CT3-107": {
    title: "Chương trình Python: Máy tính bỏ túi",
    desc: "Viết chương trình Python thực hiện 4 phép tính (+, –, ×, ÷) cho 2 số do người dùng nhập vào.",
    steps: ["Dùng input() nhận 2 số và phép toán từ bàn phím", "Dùng if/elif xử lý từng phép tính, kiểm tra chia cho 0", "Chạy thử với ít nhất 5 bộ dữ liệu khác nhau", "Chụp màn hình terminal kết quả và code, nộp lên"],
  },
  "CT4-109": {
    title: "Lập trình robot né vật cản",
    desc: "Lập trình Arduino để robot tự động dừng và đổi hướng khi phát hiện vật cản trong phạm vi 20cm.",
    steps: ["Kết nối cảm biến siêu âm HC-SR04 với Arduino theo sơ đồ", "Viết code đọc khoảng cách từ cảm biến mỗi 100ms", "Thêm điều kiện: nếu khoảng cách < 20cm → dừng và rẽ trái", "Quay video robot hoạt động (ít nhất 3 tình huống né vật cản) và nộp lên"],
  },
  "default": {
    title: "Sản phẩm bài học",
    desc: "Hoàn thành sản phẩm theo nội dung bài học và ghi lại bằng ảnh hoặc video.",
    steps: ["Đọc lại yêu cầu của bài", "Thực hiện và hoàn thành sản phẩm", "Chụp ảnh/quay video sản phẩm từ 2–3 góc", "Nộp lên hệ thống"],
  },
};

function getSubmitTask(ct: CTKey, courseId: number) {
  const key = `${ct}-${courseId}`;
  return SUBMIT_TASK[key] ?? SUBMIT_TASK["default"];
}

/* ─── Standalone video player ────────────────────────────────────────────── */
function VideoPlayer({ lesson, course }: { lesson: Lesson; course: CourseDetail }) {
  const [playing, setPlaying] = useState(false);
  const isReview = lesson.status === "completed";
  return (
    <div
      onClick={() => setPlaying(p => !p)}
      style={{ background:"#0f0f0f", width:"100%", aspectRatio:"16/9", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative", overflow:"hidden", flexShrink:0 }}
    >
      {playing ? (
        <div style={{ textAlign:"center", color:"#fff" }}>
          <Volume2 style={{ width:48, height:48, margin:"0 auto 10px", opacity:0.35 }} />
          <div style={{ fontSize:14, fontWeight:600, opacity:0.65 }}>Video đang phát</div>
          <div style={{ fontSize:11, opacity:0.3, marginTop:4 }}>Nhấn để dừng · Kết nối backend để phát video thực tế</div>
        </div>
      ) : (
        <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
          <div style={{ fontSize:52, marginBottom:16, lineHeight:1 }}>{course.emoji}</div>
          <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,0.14)", border:"2.5px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", backdropFilter:"blur(4px)" }}>
            <PlayCircle style={{ width:36, height:36, color:"#fff" }} />
          </div>
          <div style={{ color:"#fff", fontSize:15, fontWeight:700, maxWidth:400, padding:"0 24px", lineHeight:1.4 }}>{lesson.title}</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:8 }}>⏱ {lesson.duration}{isReview ? " · Xem lại" : ""}</div>
        </div>
      )}
    </div>
  );
}

/* ─── Theory panel (no video — video is in LessonView) ───────────────────── */
function TheoryPanel({ lesson, course, ctColor }: {
  lesson: Lesson; course: CourseDetail; ctColor: string;
}) {
  const points = getPoints(course.name);
  const isReview = lesson.status === "completed";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {isReview && (
        <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#92400e", display:"flex", alignItems:"center", gap:8 }}>
          🔄 <span>Em đang <strong>xem lại</strong> bài đã học.</span>
        </div>
      )}

      <div>
        <div style={{ fontSize:15, fontWeight:800, color:"#1c1d1f", marginBottom:16 }}>Nội dung bài học</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {points.map((point, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 16px", background:"#f7f9fa", borderRadius:8, border:"1px solid #e5e7eb" }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:ctColor, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" }}>
                {i + 1}
              </div>
              <div style={{ fontSize:14, color:"#1c1d1f", paddingTop:2, lineHeight:1.5 }}>{point}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:"#fffbeb", borderRadius:8, border:"1px solid #fde68a", padding:"14px 16px", display:"flex", gap:10 }}>
        <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#d97706", marginBottom:4 }}>Ghi nhớ</div>
          <div style={{ fontSize:13, color:"#92400e", lineHeight:1.6 }}>
            Sau khi xem video, em hãy ghi lại những điều thú vị vào vở và chia sẻ với bạn trong lớp!
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Exercise panel ─────────────────────────────────────────────────────── */
function ExercisePanel({ course, lesson, ctColor }: { course: CourseDetail; lesson: Lesson; ctColor: string }) {
  const { desc, questions } = getExercise(course.ct, course.id);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const isReview = lesson.status === "completed";

  const lessonIndex = course.lessons.findIndex(l => l.id === lesson.id);
  const nextLesson  = course.lessons[lessonIndex + 1] ?? null;

  const answeredCount = Object.keys(answers).length;
  const score      = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0;
  const allAnswered = answeredCount === questions.length;
  const allCorrect  = submitted && score === questions.length;
  const emoji      = score === questions.length ? "🎉" : score >= Math.ceil(questions.length * 0.7) ? "😊" : "😅";
  const scoreColor = score === questions.length ? "#16a34a" : score >= Math.ceil(questions.length * 0.7) ? "#d97706" : "#ef4444";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Đề bài */}
      <div style={{ background:"#fff", borderRadius:14, border:`1.5px solid ${ctColor}25`, padding:"16px 18px" }}>
        <div style={{ fontSize:13, fontWeight:800, color:ctColor, marginBottom:6 }}>
          ✏️ Đề bài {isReview ? "— Xem lại" : ""}
        </div>
        <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>{desc}</div>
        {isReview && (
          <div style={{ marginTop:8, fontSize:11, color:"#9ca3af", fontStyle:"italic" }}>
            Em có thể làm lại để ôn tập. Kết quả lần trước đã được lưu.
          </div>
        )}
      </div>

      {submitted && (
        <div style={{ background: score === questions.length ? "#f0fdf4" : "#fff7ed", border:`1.5px solid ${score === questions.length ? "#bbf7d0" : "#fed7aa"}`, borderRadius:14, padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:36 }}>{emoji}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:900, color:scoreColor }}>Điểm: {score}/{questions.length} câu đúng</div>
            <div style={{ fontSize:12, color:"#6b7280", marginTop:3 }}>
              {score === questions.length ? "Xuất sắc! Em trả lời đúng tất cả." : "Xem lại những câu sai và thử làm lại nhé!"}
            </div>
          </div>
          {allCorrect && nextLesson ? (
            <Link to={`/student/lessons/${course.id}/${nextLesson.id}`} style={{ textDecoration:"none", flexShrink:0 }}>
              <button style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", borderRadius:10, border:"none", background:ctColor, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                Bài tiếp theo <ChevronRight style={{ width:15, height:15 }} />
              </button>
            </Link>
          ) : allCorrect ? (
            <Link to={`/student/courses/${course.id}`} style={{ textDecoration:"none", flexShrink:0 }}>
              <button style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", borderRadius:10, border:"none", background:ctColor, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Xem khóa học <ChevronRight style={{ width:15, height:15 }} />
              </button>
            </Link>
          ) : (
            <button onClick={() => { setAnswers({}); setSubmitted(false); }} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9, border:`1.5px solid ${ctColor}`, background:"#fff", color:ctColor, fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0 }}>
              <RotateCcw style={{ width:13, height:13 }} /> Làm lại
            </button>
          )}
        </div>
      )}

      {questions.map((q, qi) => {
        const selected = answers[qi];
        const hasAnswer = selected !== undefined;
        const isCorrect = hasAnswer && selected === q.correct;
        return (
          <div key={qi} style={{ background:"#fff", borderRadius:14, border:`1.5px solid ${submitted && hasAnswer ? (isCorrect ? "#bbf7d0" : "#fca5a5") : "#e5e7eb"}`, padding:"18px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:12 }}>
              Câu {qi + 1}: {q.q}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {q.options.map((opt, oi) => {
                const isSelected = selected === oi;
                const showCorrect = submitted && oi === q.correct;
                const showWrong   = submitted && isSelected && !isCorrect;
                return (
                  <button key={oi} disabled={submitted} onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))} style={{
                    display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, textAlign:"left", width:"100%",
                    cursor: submitted ? "default" : "pointer",
                    border:`1.5px solid ${showCorrect ? "#16a34a" : showWrong ? "#ef4444" : isSelected ? ctColor : "#e5e7eb"}`,
                    background: showCorrect ? "#f0fdf4" : showWrong ? "#fef2f2" : isSelected ? ctColor+"0d" : "#fafafa",
                  }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, border:`2px solid ${showCorrect ? "#16a34a" : showWrong ? "#ef4444" : isSelected ? ctColor : "#d1d5db"}`, background: showCorrect ? "#16a34a" : showWrong ? "#ef4444" : isSelected ? ctColor : "transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {showCorrect && <CheckCircle2 style={{ width:12, height:12, color:"#fff" }} />}
                      {!showCorrect && isSelected && <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }} />}
                    </div>
                    <span style={{ fontSize:13, color: showCorrect ? "#16a34a" : showWrong ? "#ef4444" : "#374151", fontWeight: isSelected ? 600 : 400 }}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {!submitted && (
        <button disabled={!allAnswered} onClick={() => setSubmitted(true)} style={{
          padding:"13px", borderRadius:11, fontSize:14, fontWeight:700, border:"none",
          background: allAnswered ? `linear-gradient(135deg,${ctColor}dd,${ctColor})` : "#f3f4f6",
          color: allAnswered ? "#fff" : "#9ca3af",
          cursor: allAnswered ? "pointer" : "not-allowed",
          boxShadow: allAnswered ? `0 4px 12px ${ctColor}30` : "none",
        }}>
          {allAnswered ? "✅ Nộp bài" : `Còn ${questions.length - answeredCount} câu chưa trả lời`}
        </button>
      )}
    </div>
  );
}

/* ─── Submit panel ───────────────────────────────────────────────────────── */
function SubmitPanel({ course, lesson, ctColor, ctBg }: {
  course: CourseDetail; lesson: Lesson; ctColor: string; ctBg: string;
}) {
  const task = getSubmitTask(course.ct, course.id);
  const [submitted, setSubmitted] = useState(false);
  const [description, setDescription] = useState("");
  const isReview = lesson.status === "completed";

  if (submitted) {
    return (
      <div style={{ background:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:16, padding:"48px 24px", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
        <div style={{ fontSize:18, fontWeight:900, color:"#16a34a", marginBottom:8 }}>Nộp sản phẩm thành công!</div>
        <div style={{ fontSize:13, color:"#6b7280", lineHeight:1.6 }}>
          Cô/thầy sẽ xem và nhận xét sản phẩm của em trong vài ngày tới.<br />Em sẽ nhận được thông báo khi có kết quả!
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:20, fontSize:12, color:"#16a34a", fontWeight:700 }}>
          <CheckCircle2 style={{ width:16, height:16 }} />
          Đã ghi nhận lúc {new Date().toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit" })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Đề bài */}
      <div style={{ background:ctBg, borderRadius:14, border:`1.5px solid ${ctColor}25`, padding:"18px" }}>
        <div style={{ fontSize:13, fontWeight:800, color:ctColor, marginBottom:8 }}>
          📋 Đề bài: {task.title} {isReview ? "— Đã nộp" : ""}
        </div>
        <div style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginBottom:12 }}>{task.desc}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {task.steps.map((step, i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:ctColor, color:"#fff", fontSize:11, fontWeight:800, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>{i+1}</div>
              <div style={{ fontSize:12, color:"#374151", paddingTop:4, lineHeight:1.5 }}>{step}</div>
            </div>
          ))}
        </div>
        {isReview && (
          <div style={{ marginTop:12, padding:"8px 12px", background:"rgba(255,255,255,0.6)", borderRadius:8, fontSize:11, color:"#6b7280" }}>
            ✅ Em đã nộp bài này. Em có thể nộp lại để cập nhật sản phẩm.
          </div>
        )}
      </div>

      {/* Upload */}
      <div style={{ border:`2px dashed ${ctColor}50`, borderRadius:14, padding:"36px 20px", textAlign:"center", background:"#fafafa", cursor:"pointer", transition:"background .2s" }}
        onMouseEnter={e => { e.currentTarget.style.background = ctBg; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#fafafa"; }}>
        <div style={{ fontSize:38, marginBottom:8 }}>📸</div>
        <div style={{ fontSize:14, fontWeight:700, color:"#374151", marginBottom:4 }}>Kéo & thả ảnh/video vào đây</div>
        <div style={{ fontSize:12, color:"#9ca3af", marginBottom:14 }}>JPG, PNG, MP4 · Tối đa 10MB mỗi file</div>
        <button style={{ padding:"8px 20px", borderRadius:9, background:ctColor, color:"#fff", border:"none", fontSize:13, fontWeight:700, cursor:"pointer" }}>Chọn file từ máy</button>
      </div>

      {/* Description textarea */}
      <div>
        <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>
          Mô tả sản phẩm <span style={{ color:"#9ca3af", fontWeight:400 }}>(không bắt buộc)</span>
        </label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Em hãy viết 2–3 câu mô tả sản phẩm, khó khăn gặp phải và cách em giải quyết..."
          style={{ width:"100%", minHeight:88, padding:"10px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", fontSize:13, color:"#374151", resize:"vertical", outline:"none", fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.6 }} />
      </div>

      <button onClick={() => setSubmitted(true)} style={{ padding:"13px", borderRadius:11, fontSize:14, fontWeight:700, background:`linear-gradient(135deg,${ctColor}dd,${ctColor})`, color:"#fff", border:"none", cursor:"pointer", boxShadow:`0 4px 12px ${ctColor}30` }}>
        📤 {isReview ? "Nộp lại" : "Nộp sản phẩm"}
      </button>
    </div>
  );
}

/* ─── Lesson view (manages tab state, key-reset by parent) ───────────────── */
type TabId = "theory" | "exercise" | "submit";
const TAB_META: Record<TabId, { label:string; emoji:string }> = {
  theory:   { label:"Lý thuyết",    emoji:"📖" },
  exercise: { label:"Bài tập",      emoji:"✏️" },
  submit:   { label:"Nộp sản phẩm", emoji:"📤" },
};

function LessonView({ course, lesson }: { course: CourseDetail; lesson: Lesson }) {
  const ct = CT_META[course.ct];
  const availableTabs = (["theory","exercise","submit"] as TabId[]).filter(tab =>
    tab === "theory" ? lesson.hasTheory : tab === "exercise" ? lesson.hasExercise : lesson.hasSubmit
  );
  const [activeTab, setActiveTab] = useState<TabId>(availableTabs[0] ?? "theory");

  const lessonIndex = course.lessons.findIndex(l => l.id === lesson.id);
  const prevLesson  = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
  const nextLesson  = course.lessons[lessonIndex + 1] ?? null;
  const pct         = Math.round((course.lessonsDone / course.lessonsTotal) * 100);
  const isReview    = lesson.status === "completed";

  return (
    <div style={{ margin:"-24px", display:"flex", flexDirection:"column", minHeight:"calc(100vh - 56px - 48px)" }}>

      {/* ── Dark top bar ── */}
      <div style={{ background:"#1c1d1f", borderBottom:"1px solid #2d2f31", height:52, display:"flex", alignItems:"center", padding:"0 20px", gap:14, flexShrink:0 }}>
        <Link to={`/student/courses/${course.id}`} style={{ color:"#a1a1a1", textDecoration:"none", display:"flex", alignItems:"center", gap:5, fontSize:12, whiteSpace:"nowrap", flexShrink:0 }}>
          <ArrowLeft style={{ width:14, height:14 }} /> {course.name}
        </Link>
        <span style={{ color:"#3e4143", flexShrink:0 }}>·</span>
        <div style={{ flex:1, fontSize:13, color:"#e0e0e0", fontWeight:500, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          Bài {lesson.id}: {lesson.title}
        </div>
        {/* Prev / Next */}
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          {prevLesson ? (
            <Link to={`/student/lessons/${course.id}/${prevLesson.id}`} style={{ textDecoration:"none" }}>
              <button style={{ background:"transparent", border:"1px solid #3e4143", borderRadius:4, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#a1a1a1" }}>
                <ChevronLeft style={{ width:16, height:16 }} />
              </button>
            </Link>
          ) : (
            <button disabled style={{ background:"transparent", border:"1px solid #2d2f31", borderRadius:4, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"not-allowed", color:"#3e4143" }}>
              <ChevronLeft style={{ width:16, height:16 }} />
            </button>
          )}
          {nextLesson ? (
            <Link to={`/student/lessons/${course.id}/${nextLesson.id}`} style={{ textDecoration:"none" }}>
              <button style={{ background:ct.color, border:"none", borderRadius:4, padding:"0 14px", height:32, display:"flex", alignItems:"center", gap:6, cursor:"pointer", color:"#fff", fontSize:12, fontWeight:700 }}>
                Tiếp theo <ChevronRight style={{ width:14, height:14 }} />
              </button>
            </Link>
          ) : (
            <button disabled style={{ background:"#3e4143", border:"none", borderRadius:4, padding:"0 14px", height:32, display:"flex", alignItems:"center", gap:6, cursor:"not-allowed", color:"#666", fontSize:12 }}>
              Tiếp theo <ChevronRight style={{ width:14, height:14 }} />
            </button>
          )}
        </div>
        {/* Progress */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div style={{ width:90, height:3, background:"#3e4143", borderRadius:99 }}>
            <div style={{ width:`${pct}%`, height:"100%", background:ct.color, borderRadius:99 }} />
          </div>
          <span style={{ fontSize:11, color:"#a1a1a1", whiteSpace:"nowrap" }}>{pct}% hoàn thành</span>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display:"flex", flex:1, alignItems:"flex-start" }}>

        {/* Left: video + tabs + content */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Video — full width, edge to edge */}
          <VideoPlayer lesson={lesson} course={course} />

          {/* Lesson meta + tab nav */}
          <div style={{ borderBottom:"1px solid #d1d7dc", padding:"16px 24px 0", background:"#fff" }}>
            <h1 style={{ fontSize:18, fontWeight:800, color:"#1c1d1f", margin:"0 0 8px", lineHeight:1.3 }}>
              Bài {lesson.id}: {lesson.title}
            </h1>
            <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:12, color:"#6b7280", marginBottom:14, flexWrap:"wrap" }}>
              <span>👩‍🏫 {course.teacher}</span>
              <span>⏱ {lesson.duration}</span>
              <span style={{ color:ct.color, fontWeight:700 }}>{ct.label}</span>
              {isReview && <span style={{ color:"#16a34a", fontWeight:700, background:"#dcfce7", padding:"1px 8px", borderRadius:99, fontSize:11 }}>✓ Đã học</span>}
            </div>

            {/* Underline tabs */}
            {availableTabs.length > 1 && (
              <div style={{ display:"flex" }}>
                {availableTabs.map(tab => {
                  const isActive = activeTab === tab;
                  return (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                      padding:"0 0 12px", marginRight:28,
                      fontSize:13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#1c1d1f" : "#6b7280",
                      background:"transparent", border:"none",
                      borderBottom:`2.5px solid ${isActive ? "#1c1d1f" : "transparent"}`,
                      cursor:"pointer", transition:"all .15s",
                    }}>
                      {TAB_META[tab].emoji} {TAB_META[tab].label}
                    </button>
                  );
                })}
              </div>
            )}
            {availableTabs.length === 1 && (
              <div style={{ paddingBottom:12, fontSize:13, fontWeight:700, color:"#1c1d1f", borderBottom:`2.5px solid #1c1d1f`, display:"inline-block" }}>
                {TAB_META[availableTabs[0]].emoji} {TAB_META[availableTabs[0]].label}
              </div>
            )}
          </div>

          {/* Tab content */}
          <div style={{ padding:"28px 24px", background:"#fff" }}>
            {activeTab === "theory"   && <TheoryPanel   lesson={lesson} course={course} ctColor={ct.color} />}
            {activeTab === "exercise" && <ExercisePanel  lesson={lesson} course={course} ctColor={ct.color} />}
            {activeTab === "submit"   && <SubmitPanel    lesson={lesson} course={course} ctColor={ct.color} ctBg={ct.bg} />}
          </div>
        </div>

        {/* Right: course curriculum sidebar */}
        <div style={{ width:330, borderLeft:"1px solid #d1d7dc", flexShrink:0, background:"#f7f9fa", alignSelf:"stretch" }}>
          {/* Sticky header */}
          <div style={{ padding:"16px 20px", borderBottom:"1px solid #d1d7dc", position:"sticky", top:0, background:"#f7f9fa", zIndex:10 }}>
            <div style={{ fontSize:13, fontWeight:800, color:"#1c1d1f", marginBottom:6 }}>Nội dung khóa học</div>
            <div style={{ fontSize:11, color:"#6b7280", marginBottom:8 }}>{course.lessonsDone}/{course.lessonsTotal} bài đã hoàn thành</div>
            <div style={{ height:4, background:"#d1d7dc", borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:`${pct}%`, height:"100%", background:ct.color, borderRadius:99 }} />
            </div>
          </div>

          {/* Lesson list */}
          <div>
            {course.lessons.map((l) => {
              const isActive  = l.id === lesson.id;
              const isDone    = l.status === "completed";
              const isLocked  = l.status === "locked";
              const isStem    = l.hasSubmit;

              const inner = (
                <div style={{
                  display:"flex", alignItems:"flex-start", gap:10,
                  padding:"11px 20px",
                  background: isActive ? ct.color+"12" : "transparent",
                  borderLeft:`3px solid ${isActive ? ct.color : "transparent"}`,
                  borderBottom:"1px solid #e5e7eb",
                  opacity: isLocked ? 0.45 : 1,
                }}>
                  <div style={{ flexShrink:0, marginTop:2 }}>
                    {isDone
                      ? <CheckCircle2 style={{ width:15, height:15, color:"#16a34a" }} />
                      : isActive
                        ? <PlayCircle style={{ width:15, height:15, color:ct.color }} />
                        : <div style={{ width:15, height:15, borderRadius:"50%", border:"1.5px solid #ccc" }} />
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight: isActive ? 700 : 400, color: isActive ? ct.color : isLocked ? "#9ca3af" : "#1c1d1f", lineHeight:1.45, marginBottom:3 }}>
                      {l.title}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:10, color:"#6b7280" }}>⏱ {l.duration}</span>
                      {isStem && !isLocked && (
                        <span style={{ fontSize:9, fontWeight:700, color:"#92400e", background:"#fef3c7", border:"1px solid #fde68a", padding:"1px 5px", borderRadius:3 }}>STEM</span>
                      )}
                    </div>
                  </div>
                </div>
              );

              return isLocked
                ? <div key={l.id}>{inner}</div>
                : (
                  <Link key={l.id} to={`/student/lessons/${course.id}/${l.id}`} style={{ textDecoration:"none", display:"block" }}>
                    {inner}
                  </Link>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Entry point — key prop resets LessonView state on navigation ───────── */
export default function THLessonPlayer() {
  const { courseId, lessonId } = useParams<{ courseId:string; lessonId:string }>();
  const course = COURSE_DETAILS[Number(courseId)] ?? makeFallback(Number(courseId));

  if (!course) return (
    <div style={{ textAlign:"center", padding:"60px 20px" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>😕</div>
      <div style={{ fontSize:16, fontWeight:700, color:"#374151", marginBottom:8 }}>Không tìm thấy khóa học</div>
      <Link to="/student/courses" style={{ color:"#990803", fontSize:13 }}>← Quay lại danh sách</Link>
    </div>
  );

  const lesson = course.lessons.find(l => l.id === Number(lessonId));
  if (!lesson) return (
    <div style={{ textAlign:"center", padding:"60px 20px" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>😕</div>
      <div style={{ fontSize:16, fontWeight:700, color:"#374151", marginBottom:8 }}>Không tìm thấy bài học</div>
      <Link to={`/student/courses/${courseId}`} style={{ color:"#990803", fontSize:13 }}>← Quay lại khóa học</Link>
    </div>
  );

  // key prop ensures LessonView remounts (resets all state) when lesson changes
  return <LessonView key={`${courseId}-${lessonId}`} course={course} lesson={lesson} />;
}
