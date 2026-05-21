import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, BookOpen, User, Clock, CheckCircle2, PlayCircle, Lock, ClipboardList, Upload, ChevronDown, ChevronRight } from "lucide-react";

/* ─── CT meta ────────────────────────────────────────────────────────────── */
const CT_META = {
  CT1: { label:"CT1 – Tích hợp môn học",   color:"#990803", bg:"#FFF8F8" },
  CT2: { label:"CT2 – Liên môn",            color:"#2563eb", bg:"#EFF6FF" },
  CT3: { label:"CT3 – Tăng cường",          color:"#7c3aed", bg:"#F5F3FF" },
  CT4: { label:"CT4 – Robotics / AI / IoT", color:"#f59e0b", bg:"#FFFBEB" },
  CT5: { label:"CT5 – NCKH",                color:"#16a34a", bg:"#F0FDF4" },
} as const;
type CTKey = keyof typeof CT_META;

/* ─── Lesson structure ───────────────────────────────────────────────────── */
type LessonStatus = "completed" | "current" | "locked";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  status: LessonStatus;
  hasTheory:   boolean;
  hasExercise: boolean;
  hasSubmit:   boolean;
}

interface CourseDetail {
  id: number; ct: CTKey; name: string; subject: string;
  teacher: string; emoji: string; desc: string;
  lessonsTotal: number; lessonsDone: number;
  status: "inprogress" | "completed";
  lessons: Lesson[];
}

/* ─── Chapter definitions ────────────────────────────────────────────────── */
type ChapterDef = { title: string; from: number; to: number };

const CHAPTER_DEFS: Record<number, ChapterDef[]> = {
  1: [
    { title: "Số học và Phép tính cơ bản", from: 1,  to: 8  },
    { title: "Hình học phẳng",              from: 9,  to: 12 },
    { title: "Phép nhân và Phép chia",      from: 13, to: 18 },
    { title: "Chủ đề nâng cao",             from: 19, to: 24 },
  ],
  2: [
    { title: "Đọc hiểu và Từ vựng STEM",   from: 1,  to: 5  },
    { title: "Viết và Kể chuyện",           from: 6,  to: 10 },
    { title: "Ngữ pháp và Văn phong",       from: 11, to: 16 },
    { title: "Ôn tập và Kiểm tra",          from: 17, to: 20 },
  ],
  7: [
    { title: "Nhập môn Scratch",            from: 1,  to: 7  },
    { title: "Vòng lặp và Điều kiện",       from: 8,  to: 13 },
    { title: "Dự án và Tích hợp STEM",      from: 14, to: 20 },
  ],
  101: [
    { title: "Đa thức",                     from: 1,  to: 8  },
    { title: "Phân tích nhân tử",           from: 9,  to: 12 },
    { title: "Phân thức đại số",            from: 13, to: 18 },
    { title: "Phương trình bậc hai",        from: 19, to: 24 },
    { title: "Hàm số và Hệ phương trình",   from: 25, to: 32 },
  ],
  107: [
    { title: "Nhập môn Python",             from: 1,  to: 4  },
    { title: "Cấu trúc điều khiển",         from: 5,  to: 8  },
    { title: "Hàm và Cấu trúc dữ liệu",    from: 9,  to: 13 },
    { title: "Dự án và Nâng cao",           from: 14, to: 20 },
  ],
  109: [
    { title: "Arduino và thiết bị cơ bản",  from: 1,  to: 7  },
    { title: "Cảm biến và Điều khiển",      from: 8,  to: 13 },
    { title: "IoT và Dự án cuối",           from: 14, to: 18 },
  ],
  // ── THPT Lớp 12 ──
  201: [
    { title: "Khảo sát và vẽ đồ thị hàm số",      from: 1,  to: 8  },
    { title: "Nguyên hàm và Tích phân",            from: 9,  to: 16 },
    { title: "Số phức",                            from: 17, to: 20 },
    { title: "Hình học không gian",                from: 21, to: 26 },
    { title: "Tổ hợp – Xác suất",                 from: 27, to: 32 },
  ],
  202: [
    { title: "Dao động cơ và Sóng cơ",             from: 1,  to: 7  },
    { title: "Điện xoay chiều",                    from: 8,  to: 14 },
    { title: "Dao động và Sóng điện từ",           from: 15, to: 19 },
    { title: "Ánh sáng và Lượng tử",              from: 20, to: 26 },
  ],
  203: [
    { title: "Este – Lipit",                       from: 1,  to: 6  },
    { title: "Cacbohiđrat – Amin – Protein",       from: 7,  to: 13 },
    { title: "Polime và Vật liệu",                 from: 14, to: 18 },
    { title: "Đại cương kim loại",                 from: 19, to: 24 },
    { title: "Kim loại điển hình",                 from: 25, to: 28 },
  ],
  204: [
    { title: "Cơ chế di truyền và biến dị",       from: 1,  to: 7  },
    { title: "Tính quy luật của hiện tượng di truyền", from: 8, to: 14 },
    { title: "Di truyền học quần thể và Tiến hóa",from: 15, to: 18 },
    { title: "Sinh thái học",                      from: 19, to: 22 },
  ],
  205: [
    { title: "Đọc hiểu và Nghị luận xã hội",      from: 1,  to: 6  },
    { title: "Nghị luận văn học – Thơ",            from: 7,  to: 12 },
    { title: "Nghị luận văn học – Văn xuôi",       from: 13, to: 17 },
    { title: "Ôn tập và Luyện đề THPT QG",         from: 18, to: 20 },
  ],
  206: [
    { title: "Units 1–3: Life & Society",          from: 1,  to: 6  },
    { title: "Units 4–6: Science & Technology",    from: 7,  to: 12 },
    { title: "Units 7–10: Future & Environment",   from: 13, to: 17 },
    { title: "Luyện đề THPT QG",                   from: 18, to: 20 },
  ],
  207: [
    { title: "Python nâng cao",                    from: 1,  to: 5  },
    { title: "Xử lý dữ liệu với pandas",           from: 6,  to: 11 },
    { title: "Trực quan hóa và Machine Learning",  from: 12, to: 16 },
    { title: "Dự án STEM cuối khóa",               from: 17, to: 20 },
  ],
  208: [
    { title: "Chọn chủ đề và Thiết kế nghiên cứu",from: 1,  to: 4  },
    { title: "Thu thập và Phân tích dữ liệu",      from: 5,  to: 8  },
    { title: "Viết báo cáo và Thuyết trình",       from: 9,  to: 12 },
  ],
};

function getChapters(courseId: number, lessons: Lesson[]): { title: string; lessons: Lesson[] }[] | null {
  // Tiểu học và Mầm non không có cấu trúc chương — hiển thị danh sách phẳng
  if (courseId < 100) return null;

  const defs = CHAPTER_DEFS[courseId];
  if (defs) {
    return defs.map(d => ({
      title: d.title,
      lessons: lessons.filter(l => l.id >= d.from && l.id <= d.to),
    }));
  }
  // THCS/THPT chưa có định nghĩa: tự nhóm ~5 bài/phần
  const chunkSize = Math.max(4, Math.ceil(lessons.length / Math.ceil(lessons.length / 5)));
  const chapters: { title: string; lessons: Lesson[] }[] = [];
  for (let i = 0; i < lessons.length; i += chunkSize) {
    chapters.push({ title: `Phần ${chapters.length + 1}`, lessons: lessons.slice(i, i + chunkSize) });
  }
  return chapters;
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const COURSE_DETAILS: Record<number, CourseDetail> = {
  1: {
    id:1, ct:"CT1", name:"Toán Tư Duy STEM", subject:"Toán học", teacher:"Cô Lan Anh",
    emoji:"🔢", lessonsTotal:24, lessonsDone:18, status:"inprogress",
    desc:"Phát triển tư duy logic và giải quyết vấn đề qua các bài toán thực tiễn theo phương pháp STEM tích hợp.",
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
    desc:"Phát triển kỹ năng đọc hiểu, sáng tạo văn bản theo phương pháp STEM tích hợp.",
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
    desc:"Học lập trình trực quan qua Scratch, xây dựng trò chơi và hoạt hình tương tác theo phương pháp STEM tăng cường.",
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

  /* ═══════════════════════════════════════════════════════
     THCS — Lớp 8 (IDs 101–110)
     ═══════════════════════════════════════════════════════ */
  101: {
    id:101, ct:"CT1", name:"Toán 8 – Đại số & Hình học", subject:"Toán học", teacher:"Cô Ngọc Hà",
    emoji:"🔢", lessonsTotal:32, lessonsDone:22, status:"inprogress",
    desc:"Bám sát SGK Toán 8: đa thức, phân thức đại số, phương trình bậc hai – kết hợp 2–3 tiết STEM thực hành mô hình hóa toán học trong thực tế.",
    lessons: [
      { id:1,  title:"Ôn tập đại số lớp 7",                   duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:2,  title:"Đơn thức và đa thức",                   duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:3,  title:"Cộng và trừ đa thức",                   duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:4,  title:"Kiểm tra bài 1–3",                      duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:5,  title:"Nhân đơn thức với đa thức",             duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:6,  title:"Nhân đa thức với đa thức",              duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:7,  title:"Hằng đẳng thức đáng nhớ (nhóm 1)",     duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:8,  title:"Kiểm tra giữa khoá",                    duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:9,  title:"Hằng đẳng thức đáng nhớ (nhóm 2)",     duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:10, title:"Phân tích nhân tử: đặt nhân tử chung", duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:11, title:"Phân tích nhân tử: dùng hằng đẳng thức",duration:"25 phút",status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:12, title:"Kiểm tra bài 9–11",                     duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:13, title:"Phân thức đại số",                      duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:14, title:"Rút gọn và cộng trừ phân thức",        duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:15, title:"Nhân và chia phân thức",               duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:16, title:"Bài toán thực tế: phân thức",          duration:"35 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:17, title:"Ôn tập học kỳ 1",                       duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:18, title:"Kiểm tra học kỳ 1",                     duration:"45 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:19, title:"Phương trình bậc hai – Lý thuyết",     duration:"30 phút", status:"current",   hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:20, title:"Phương trình bậc hai – Luyện tập",     duration:"35 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:21, title:"Công thức nghiệm tổng quát (Δ)",       duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:22, title:"Bài tập tổng hợp phương trình bậc hai",duration:"40 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:23, title:"Ứng dụng STEM: mô hình hóa thực tế",  duration:"45 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:true  },
      { id:24, title:"Kiểm tra chương phương trình",          duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:25, title:"Hàm số bậc hai y = ax²",               duration:"25 phút", status:"locked",    hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:26, title:"Đồ thị parabol",                        duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:27, title:"Thực hành: vẽ đồ thị bằng GeoGebra",  duration:"40 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:28, title:"Hệ phương trình bậc nhất hai ẩn",      duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:29, title:"Giải hệ phương trình – phương pháp thế",duration:"30 phút",status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:30, title:"Dự án STEM: mô hình toán học",         duration:"60 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:31, title:"Ôn tập cuối năm",                       duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:32, title:"Kiểm tra cuối kỳ",                      duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
    ],
  },
  107: {
    id:107, ct:"CT3", name:"Tin học 8 – Lập trình Python", subject:"Tin học", teacher:"Thầy Minh Đức",
    emoji:"💻", lessonsTotal:20, lessonsDone:8, status:"inprogress",
    desc:"Chương trình Tin học 8 tăng cường: học lập trình Python từ cơ bản — biến, vòng lặp, hàm, danh sách — và xây dựng dự án ứng dụng nhỏ theo tiết STEM thực hành.",
    lessons: [
      { id:1,  title:"Giới thiệu Python & cài đặt môi trường",duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:2,  title:"Biến, kiểu dữ liệu và phép toán",      duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:3,  title:"Nhập xuất dữ liệu: input() & print()", duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:4,  title:"Kiểm tra bài 1–3",                     duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:5,  title:"Cấu trúc if / elif / else",             duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:6,  title:"Vòng lặp for và range()",              duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:7,  title:"Vòng lặp while",                       duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:8,  title:"Kiểm tra giữa khoá",                   duration:"15 phút", status:"completed", hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:9,  title:"Hàm (def) và tham số",                 duration:"30 phút", status:"current",   hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:10, title:"Danh sách (list) và các thao tác",     duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:11, title:"Dictionary và tuple",                   duration:"25 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:12, title:"Dự án nhỏ: máy tính bỏ túi",          duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:13, title:"Xử lý chuỗi (string)",                 duration:"25 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:14, title:"Đọc/ghi file văn bản",                 duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:15, title:"Module và thư viện chuẩn",             duration:"25 phút", status:"locked",    hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:16, title:"Dự án: phân tích dữ liệu đơn giản",   duration:"60 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:17, title:"Giới thiệu lập trình hướng đối tượng",duration:"30 phút", status:"locked",    hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:18, title:"Tích hợp STEM: mô phỏng dữ liệu",    duration:"45 phút", status:"locked",    hasTheory:true,  hasExercise:false, hasSubmit:true  },
      { id:19, title:"Ôn tập và code review",                duration:"30 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
      { id:20, title:"Kiểm tra cuối khoá",                   duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
    ],
  },
  109: {
    id:109, ct:"CT4", name:"Robotics & Arduino", subject:"Robotics", teacher:"Thầy Hoàng",
    emoji:"🤖", lessonsTotal:18, lessonsDone:7, status:"inprogress",
    desc:"Chương trình Robotics CT4: lập trình Arduino, tích hợp cảm biến, xây dựng robot tự hành và dự án IoT — tiết STEM thực hành chiếm 40% tổng thời lượng.",
    lessons: [
      { id:1,  title:"Ôn tập Robotics cơ bản",               duration:"20 phút", status:"completed", hasTheory:true,  hasExercise:false, hasSubmit:false },
      { id:2,  title:"Arduino Uno: cấu trúc và lập trình",   duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:3,  title:"LED, buzzer và digital output",         duration:"25 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
      { id:4,  title:"Cảm biến siêu âm (HC-SR04)",           duration:"30 phút", status:"completed", hasTheory:true,  hasExercise:true,  hasSubmit:false },
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
      { id:16, title:"Dự án cuối: trạm quan trắc môi trường",duration:"90 phút",status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:17, title:"Thuyết trình và bảo vệ dự án",        duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:false, hasSubmit:true  },
      { id:18, title:"Kiểm tra cuối khoá",                   duration:"45 phút", status:"locked",    hasTheory:false, hasExercise:true,  hasSubmit:false },
    ],
  },
};

/* Fallback cho course chưa có data đầy đủ */
function makeFallback(id: number): CourseDetail | null {
  const base: Record<number, Omit<CourseDetail,"lessons">> = {
    // ── Tiểu học lớp 3 ──
    3:  { id:3,  ct:"CT1", name:"Tự nhiên & Xã hội lớp 3", subject:"Khoa học",         teacher:"Thầy Quang",    emoji:"🔬", lessonsTotal:18, lessonsDone:11, status:"inprogress", desc:"SGK Tự nhiên & Xã hội lớp 3: cơ thể người, thực vật, động vật, môi trường — kết hợp các tiết STEM quan sát và thực hành." },
    4:  { id:4,  ct:"CT1", name:"Tiếng Anh lớp 3",          subject:"Ngoại ngữ",        teacher:"Cô Thu Trang",  emoji:"🌐", lessonsTotal:16, lessonsDone:16, status:"completed",  desc:"Chương trình Tiếng Anh lớp 3 theo SGK: từ vựng, mẫu câu cơ bản qua các chủ đề gần gũi với học sinh tiểu học." },
    8:  { id:8,  ct:"CT3", name:"Thiết kế & Sáng tạo",      subject:"Đổi mới sáng tạo", teacher:"Cô Hải Yến",   emoji:"✂️", lessonsTotal:12, lessonsDone:1,  status:"inprogress", desc:"Chương trình CT3 tăng cường sáng tạo: thiết kế và chế tạo sản phẩm nhỏ, phát triển tư duy kỹ thuật từ sớm." },
    9:  { id:9,  ct:"CT4", name:"Robotics nhí",              subject:"Robotics",         teacher:"Thầy Hoàng",    emoji:"🤖", lessonsTotal:15, lessonsDone:8,  status:"inprogress", desc:"Chương trình CT4 Robotics: lắp ráp Lego và lập trình robot đơn giản, xây dựng tư duy logic và kỹ thuật." },
    // ── THCS lớp 8 ──
    102:{ id:102,ct:"CT1", name:"Vật lý 8",                  subject:"Vật lý",           teacher:"Thầy Quang",    emoji:"⚡", lessonsTotal:28, lessonsDone:18, status:"inprogress", desc:"SGK Vật lý 8: cơ học, áp suất, lực đẩy Archimedes, công và năng lượng, nhiệt học — kết hợp thí nghiệm STEM thực hành." },
    103:{ id:103,ct:"CT1", name:"Hóa học 8",                 subject:"Hóa học",          teacher:"Thầy Trung Nam",emoji:"🧪", lessonsTotal:24, lessonsDone:20, status:"inprogress", desc:"SGK Hóa học 8: chất – nguyên tử – phân tử, phản ứng hóa học, oxi, hiđro, nước, dung dịch — kết hợp thí nghiệm STEM an toàn." },
    104:{ id:104,ct:"CT1", name:"Sinh học 8 – Cơ thể người", subject:"Sinh học",         teacher:"Cô Phương Mai", emoji:"🌿", lessonsTotal:20, lessonsDone:14, status:"inprogress", desc:"SGK Sinh học 8: hệ vận động, tuần hoàn, hô hấp, tiêu hóa, thần kinh — kết hợp tiết STEM thực hành quan sát mô hình." },
    105:{ id:105,ct:"CT1", name:"Ngữ văn 8",                 subject:"Ngữ văn",          teacher:"Cô Lan Anh",    emoji:"📖", lessonsTotal:22, lessonsDone:19, status:"inprogress", desc:"SGK Ngữ văn 8: văn tự sự, miêu tả, nghị luận — thơ và truyện hiện đại Việt Nam — kết hợp tiết STEM viết báo cáo và thuyết trình." },
    106:{ id:106,ct:"CT1", name:"Tiếng Anh 8",               subject:"Ngoại ngữ",        teacher:"Cô Thu Trang",  emoji:"🌐", lessonsTotal:26, lessonsDone:24, status:"inprogress", desc:"SGK Tiếng Anh 8: ngữ pháp, kỹ năng đọc–nghe–nói–viết qua 16 unit — kết hợp tiết STEM giao tiếp về chủ đề khoa học kỹ thuật." },
    108:{ id:108,ct:"CT3", name:"Thiết kế 3D & Chế tạo",    subject:"Sáng tạo số",      teacher:"Cô Hải Yến",   emoji:"🎨", lessonsTotal:16, lessonsDone:5,  status:"inprogress", desc:"Chương trình CT3: thiết kế mô hình 3D bằng Tinkercad và in prototype — tiết STEM chiếm 50% thời lượng thực hành chế tạo." },
    110:{ id:110,ct:"CT4", name:"AI cho học sinh",            subject:"Tin học",          teacher:"Thầy Tuấn",     emoji:"🧠", lessonsTotal:15, lessonsDone:4,  status:"inprogress", desc:"Chương trình CT4: nhập môn AI — phân loại dữ liệu, mô hình học máy đơn giản và ứng dụng thực tế dành cho học sinh lớp 8." },
    // ── THPT lớp 12, Ban KHTN ──
    201:{ id:201,ct:"CT1", name:"Toán 12 – Giải tích & Hình học",  subject:"Toán học",  teacher:"Cô Ngọc Hà",    emoji:"📊", lessonsTotal:32, lessonsDone:20, status:"inprogress", desc:"SGK Toán 12: ứng dụng đạo hàm, nguyên hàm–tích phân, số phức, hình học không gian, tổ hợp–xác suất — kết hợp tiết STEM mô hình hóa và tối ưu hóa." },
    202:{ id:202,ct:"CT1", name:"Vật lý 12",                        subject:"Vật lý",    teacher:"Thầy Quang Huy",emoji:"⚡", lessonsTotal:26, lessonsDone:15, status:"inprogress", desc:"SGK Vật lý 12: dao động điều hòa, sóng cơ, điện xoay chiều, sóng điện từ, ánh sáng, lượng tử, hạt nhân — kết hợp thí nghiệm STEM thực hành." },
    203:{ id:203,ct:"CT1", name:"Hóa học 12",                       subject:"Hóa học",   teacher:"Cô Bích Ngọc",  emoji:"🧪", lessonsTotal:28, lessonsDone:20, status:"inprogress", desc:"SGK Hóa học 12: este–lipit, cacbohiđrat, amin–aminoaxit–protein, polime, kim loại — kết hợp thí nghiệm STEM hóa học ứng dụng thực tế." },
    204:{ id:204,ct:"CT1", name:"Sinh học 12",                      subject:"Sinh học",  teacher:"Cô Thanh Hà",   emoji:"🌿", lessonsTotal:22, lessonsDone:12, status:"inprogress", desc:"SGK Sinh học 12: di truyền học phân tử, di truyền quần thể, tiến hóa, sinh thái học — kết hợp tiết STEM phân tích dữ liệu di truyền thực tế." },
    205:{ id:205,ct:"CT1", name:"Ngữ văn 12",                       subject:"Ngữ văn",   teacher:"Cô Lan Anh",    emoji:"📖", lessonsTotal:20, lessonsDone:16, status:"inprogress", desc:"SGK Ngữ văn 12: nghị luận xã hội, nghị luận văn học, tác phẩm hiện đại — kết hợp tiết STEM trình bày và viết báo cáo học thuật." },
    206:{ id:206,ct:"CT1", name:"Tiếng Anh 12",                     subject:"Ngoại ngữ", teacher:"Cô Thu Trang",  emoji:"🌐", lessonsTotal:20, lessonsDone:20, status:"completed",  desc:"SGK Tiếng Anh 12: 10 unit với trọng tâm kỹ năng THPT QG — reading, listening, writing, speaking — kết hợp tiết STEM giao tiếp học thuật." },
    207:{ id:207,ct:"CT3", name:"Tin học 12 – Python & Dữ liệu",   subject:"Tin học",   teacher:"Thầy Minh Đức", emoji:"💻", lessonsTotal:20, lessonsDone:8,  status:"inprogress", desc:"Chương trình CT3 tăng cường: Python nâng cao, xử lý dữ liệu với pandas, trực quan hóa — dự án STEM phân tích dữ liệu thực tế." },
    208:{ id:208,ct:"CT5", name:"Dự án NCKH STEM",                  subject:"NCKH",      teacher:"Thầy Tuấn",     emoji:"🔬", lessonsTotal:12, lessonsDone:4,  status:"inprogress", desc:"Chương trình CT5 nghiên cứu khoa học: lựa chọn chủ đề, thiết kế thực nghiệm, phân tích kết quả và thuyết trình báo cáo NCKH cấp trường." },
  };
  const b = base[id];
  if (!b) return null;

  const lessons: Lesson[] = Array.from({ length: b.lessonsTotal }, (_, i) => ({
    id: i + 1,
    title: i % 3 === 0 ? `Lý thuyết bài ${Math.floor(i/3)+1}` : i % 3 === 1 ? `Luyện tập bài ${Math.floor(i/3)+1}` : `Thực hành bài ${Math.floor(i/3)+1}`,
    duration: i % 3 === 2 ? "30 phút" : "20 phút",
    status: i < b.lessonsDone - 1 ? "completed" : i === b.lessonsDone - 1 ? "current" : "locked",
    hasTheory:   i % 3 === 0,
    hasExercise: i % 3 === 1,
    hasSubmit:   i % 3 === 2,
  }));
  return { ...b, lessons };
}

/* ─── Lesson type tags ───────────────────────────────────────────────────── */
function LessonTags({ lesson, color }: { lesson: Lesson; color: string }) {
  const isLocked = lesson.status === "locked";
  const tagColor = isLocked ? "#9ca3af" : color;
  return (
    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
      {lesson.hasTheory && (
        <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:99, background: isLocked ? "#f3f4f6" : tagColor+"15", color: isLocked ? "#9ca3af" : tagColor, border:`1px solid ${isLocked ? "#e5e7eb" : tagColor+"30"}` }}>
          📖 Lý thuyết
        </span>
      )}
      {lesson.hasExercise && (
        <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:99, background: isLocked ? "#f3f4f6" : "#fffbeb", color: isLocked ? "#9ca3af" : "#d97706", border:`1px solid ${isLocked ? "#e5e7eb" : "#fde68a"}` }}>
          ✏️ Bài tập
        </span>
      )}
      {lesson.hasSubmit && (
        <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:99, background: isLocked ? "#f3f4f6" : "#f0fdf4", color: isLocked ? "#9ca3af" : "#16a34a", border:`1px solid ${isLocked ? "#e5e7eb" : "#bbf7d0"}` }}>
          📤 Nộp SP
        </span>
      )}
    </div>
  );
}

/* ─── Lesson row ─────────────────────────────────────────────────────────── */
function LessonRow({ lesson, ctColor, courseId }: { lesson: Lesson; ctColor: string; courseId: number }) {
  const isCompleted = lesson.status === "completed";
  const isCurrent   = lesson.status === "current";
  const isLocked    = lesson.status === "locked";
  const isStem      = lesson.hasSubmit; // tiết STEM = tiết thực hành/dự án có nộp sản phẩm

  const stemBg     = isStem && !isLocked ? "#fffbeb" : undefined;
  const stemBorder = isStem && !isLocked ? "#fde68a" : "#e5e7eb";

  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12,
      padding:"11px 14px", borderRadius:8,
      background: isCurrent ? ctColor+"08" : stemBg ?? "#fff",
      border:`1px solid ${isCurrent ? ctColor+"35" : stemBorder}`,
      opacity: isLocked ? 0.55 : 1,
      cursor: isLocked ? "default" : "pointer",
      boxShadow: isCurrent ? `0 2px 8px ${ctColor}15` : isStem && !isLocked ? "0 1px 6px rgba(251,191,36,0.18)" : "none",
      position:"relative", overflow:"hidden",
    }}>
      {/* Accent bar trái */}
      {isCurrent && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:ctColor }} />}
      {isStem && !isCurrent && !isLocked && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:"#f59e0b" }} />}

      <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: isCompleted ? "#dcfce7" : isCurrent ? ctColor : "#f3f4f6" }}>
        {isCompleted && <CheckCircle2 style={{ width:14, height:14, color:"#16a34a" }} />}
        {isCurrent   && <PlayCircle   style={{ width:14, height:14, color:"#fff"    }} />}
        {isLocked    && <Lock         style={{ width:12, height:12, color:"#9ca3af" }} />}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        {/* Title row */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
          <span style={{ fontSize:13, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? ctColor : isLocked ? "#9ca3af" : "#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            Bài {lesson.id} · {lesson.title}
          </span>
          {isStem && !isLocked && (
            <span style={{ fontSize:9, fontWeight:800, color:"#92400e", background:"#fef3c7", border:"1px solid #fde68a", padding:"2px 7px", borderRadius:4, flexShrink:0, letterSpacing:"0.3px" }}>
              🔬 TIẾT STEM
            </span>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:10, color:"#9ca3af" }}>
            <Clock style={{ width:10, height:10 }} />{lesson.duration}
          </span>
          <LessonTags lesson={lesson} color={ctColor} />
        </div>
      </div>

      {isCurrent && (
        <Link to={`/student/lessons/${courseId}/${lesson.id}`} style={{ textDecoration:"none", flexShrink:0 }}>
          <button style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:8, background:`linear-gradient(135deg,${ctColor}dd,${ctColor})`, color:"#fff", border:"none", fontSize:11, fontWeight:700, cursor:"pointer", boxShadow:`0 2px 8px ${ctColor}30`, whiteSpace:"nowrap" }}>
            <PlayCircle style={{ width:12, height:12 }} /> Học ngay
          </button>
        </Link>
      )}
      {isCompleted && (
        <Link to={`/student/lessons/${courseId}/${lesson.id}`} style={{ textDecoration:"none", flexShrink:0 }}>
          <button style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0", fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
            <CheckCircle2 style={{ width:11, height:11 }} /> Xem lại
          </button>
        </Link>
      )}
    </div>
  );
}

/* ─── Chapter section ────────────────────────────────────────────────────── */
type FilterType = null | "theory" | "exercise" | "submit";

function ChapterSection({ chapter, chapterIndex, ctColor, courseId, collapsed, onToggle, activeFilter }: {
  chapter: { title: string; lessons: Lesson[] };
  chapterIndex: number;
  ctColor: string;
  courseId: number;
  collapsed: boolean;
  onToggle: () => void;
  activeFilter: FilterType;
}) {
  const visibleLessons = activeFilter
    ? chapter.lessons.filter(l =>
        activeFilter === "theory"   ? l.hasTheory   :
        activeFilter === "exercise" ? l.hasExercise :
        l.hasSubmit
      )
    : chapter.lessons;

  if (activeFilter && visibleLessons.length === 0) return null;

  const completedCount = chapter.lessons.filter(l => l.status === "completed").length;
  const totalCount     = chapter.lessons.length;
  const hasCurrent     = chapter.lessons.some(l => l.status === "current");
  const pct            = Math.round((completedCount / totalCount) * 100);

  return (
    <div style={{ marginBottom:10 }}>
      {/* Chapter header */}
      <div
        onClick={onToggle}
        style={{
          display:"flex", alignItems:"center", gap:12,
          padding:"12px 16px",
          borderRadius: collapsed ? 10 : "10px 10px 0 0",
          background: hasCurrent ? ctColor+"0a" : "#f8fafc",
          border:`1px solid ${hasCurrent ? ctColor+"40" : "#e5e7eb"}`,
          borderBottom: collapsed ? undefined : "none",
          cursor:"pointer", userSelect:"none",
        }}
      >
        <div style={{
          width:30, height:30, borderRadius:8, flexShrink:0,
          background: hasCurrent ? ctColor : completedCount === totalCount ? "#dcfce7" : "#e5e7eb",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:12, fontWeight:800,
          color: hasCurrent ? "#fff" : completedCount === totalCount ? "#16a34a" : "#6b7280",
        }}>
          {completedCount === totalCount ? <CheckCircle2 style={{ width:14, height:14 }} /> : chapterIndex + 1}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color: hasCurrent ? ctColor : "#111827" }}>
            Chương {chapterIndex + 1}: {chapter.title}
          </div>
          <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>
            {completedCount}/{totalCount} bài · {pct}% hoàn thành
          </div>
        </div>

        {/* Mini progress bar */}
        <div style={{ width:56, height:4, background:"#e5e7eb", borderRadius:99, overflow:"hidden", flexShrink:0 }}>
          <div style={{ width:`${pct}%`, height:"100%", background: completedCount === totalCount ? "#16a34a" : ctColor, borderRadius:99 }} />
        </div>

        {collapsed
          ? <ChevronRight style={{ width:15, height:15, color:"#9ca3af", flexShrink:0 }} />
          : <ChevronDown  style={{ width:15, height:15, color:"#9ca3af", flexShrink:0 }} />
        }
      </div>

      {/* Lesson list */}
      {!collapsed && (
        <div style={{
          border:`1px solid ${hasCurrent ? ctColor+"40" : "#e5e7eb"}`,
          borderTop:"none", borderRadius:"0 0 10px 10px",
          padding:"8px", display:"flex", flexDirection:"column", gap:5,
          background:"#fafafa",
        }}>
          {visibleLessons.map(lesson => (
            <LessonRow key={lesson.id} lesson={lesson} ctColor={ctColor} courseId={courseId} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function StudentCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const numId  = Number(id);
  const detail = COURSE_DETAILS[numId] ?? makeFallback(numId);

  const chapters = detail ? getChapters(detail.id, detail.lessons) : [];

  // All chapters expanded by default; collapsed set stores chapter indices that are collapsed
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);

  if (!detail) return (
    <div style={{ textAlign:"center", padding:"60px 20px" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>😕</div>
      <div style={{ fontSize:16, fontWeight:700, color:"#374151" }}>Không tìm thấy khóa học</div>
      <Link to="/student/courses" style={{ color:"#990803", fontSize:13, marginTop:8, display:"inline-block" }}>← Quay lại danh sách</Link>
    </div>
  );

  const ct     = CT_META[detail.ct];
  const pct    = Math.round((detail.lessonsDone / detail.lessonsTotal) * 100);
  const isDone = detail.status === "completed";
  const currentLesson = detail.lessons.find(l => l.status === "current");

  const exerciseCount = detail.lessons.filter(l => l.hasExercise).length;
  const submitCount   = detail.lessons.filter(l => l.hasSubmit).length;

  const toggleChapter = (idx: number) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const FILTER_TABS: { id: FilterType; label: string; emoji: string; color: string }[] = [
    { id: null,       label: "Tất cả",        emoji: "",    color: "#374151" },
    { id: "theory",   label: "Lý thuyết",     emoji: "📖",  color: ct.color  },
    { id: "exercise", label: "Bài tập",       emoji: "✏️",  color: "#d97706" },
    { id: "submit",   label: "Nộp sản phẩm",  emoji: "📤",  color: "#16a34a" },
  ];

  return (
    <div style={{ maxWidth:820, margin:"0 auto" }}>
      {/* Back */}
      <Link to="/student/courses" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"#6b7280", textDecoration:"none", marginBottom:20 }}>
        <ArrowLeft style={{ width:15, height:15 }} /> Danh sách khóa học
      </Link>

      {/* ── Course header ── */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e5e7eb", padding:"24px", marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
          <div style={{ width:64, height:64, borderRadius:16, background:ct.bg, border:`1px solid ${ct.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, flexShrink:0 }}>
            {detail.emoji}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:99, background:ct.bg, color:ct.color, border:`1px solid ${ct.color}25` }}>{ct.label}</span>
              <span style={{ fontSize:11, color:"#9ca3af" }}>{detail.subject}</span>
              {isDone
                ? <span style={{ fontSize:11, fontWeight:700, color:"#16a34a", background:"#dcfce7", padding:"2px 8px", borderRadius:99 }}>✅ Hoàn thành</span>
                : <span style={{ fontSize:11, fontWeight:700, color:"#2563eb", background:"#eff6ff", padding:"2px 8px", borderRadius:99 }}>▶ Đang học</span>
              }
            </div>
            <h1 style={{ fontSize:20, fontWeight:900, color:"#111827", marginBottom:6 }}>{detail.name}</h1>
            <p style={{ fontSize:13, color:"#6b7280", marginBottom:10, lineHeight:1.6 }}>{detail.desc}</p>
            <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#6b7280" }}>
              <User style={{ width:13, height:13 }} />
              Giáo viên: <strong style={{ color:"#374151", marginLeft:3 }}>{detail.teacher}</strong>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginTop:20, paddingTop:20, borderTop:"1px solid #f3f4f6" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Tiến độ hoàn thành</span>
            <span style={{ fontSize:14, fontWeight:900, color: isDone ? "#16a34a" : ct.color }}>{pct}%</span>
          </div>
          <div style={{ height:8, background:"#f3f4f6", borderRadius:99, overflow:"hidden", marginBottom:6 }}>
            <div style={{ width:`${pct}%`, height:"100%", background: isDone ? "#16a34a" : `linear-gradient(90deg,${ct.color},${ct.color}cc)`, borderRadius:99 }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", gap:14 }}>
              <span style={{ fontSize:11, color:"#9ca3af", display:"flex", alignItems:"center", gap:4 }}>
                <BookOpen style={{ width:11, height:11 }} />{detail.lessonsDone}/{detail.lessonsTotal} bài hoàn thành
              </span>
              <span style={{ fontSize:11, color:"#d97706", display:"flex", alignItems:"center", gap:4 }}>
                <ClipboardList style={{ width:11, height:11 }} />{exerciseCount} bài tập
              </span>
              <span style={{ fontSize:11, color:"#16a34a", display:"flex", alignItems:"center", gap:4 }}>
                <Upload style={{ width:11, height:11 }} />{submitCount} nộp sản phẩm
              </span>
            </div>
            {currentLesson && (
              <Link to={`/student/lessons/${detail.id}/${currentLesson.id}`} style={{ textDecoration:"none" }}>
                <button style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 16px", borderRadius:9, background:`linear-gradient(135deg,${ct.color}dd,${ct.color})`, color:"#fff", border:"none", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:`0 3px 10px ${ct.color}30` }}>
                  <PlayCircle style={{ width:13, height:13 }} /> Tiếp tục học
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Lesson list ── */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e5e7eb", boxShadow:"0 2px 12px rgba(0,0,0,0.04)", overflow:"hidden" }}>

        {/* Filter tab bar (luôn hiện) */}
        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"12px 16px", borderBottom:"1px solid #f3f4f6", flexWrap:"wrap", background:"#fafafa" }}>
          <span style={{ fontSize:11, color:"#9ca3af", marginRight:2, whiteSpace:"nowrap" }}>Lọc theo:</span>
          {FILTER_TABS.map(tab => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={String(tab.id)}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  display:"flex", alignItems:"center", gap:4,
                  fontSize:11, fontWeight: isActive ? 700 : 600,
                  padding:"5px 12px", borderRadius:8, cursor:"pointer", border:"none",
                  background: isActive ? tab.color : "#fff",
                  color: isActive ? "#fff" : tab.color,
                  outline: `1.5px solid ${isActive ? tab.color : tab.color + "40"}`,
                  transition:"all 0.15s",
                }}
              >
                {tab.emoji && <span>{tab.emoji}</span>}
                {tab.label}
              </button>
            );
          })}
          <span style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af" }}>
            {chapters ? `${chapters.length} chương · ` : ""}{detail.lessonsTotal} bài
          </span>
        </div>

        {/* Flat list — Tiểu học / Mầm non */}
        {!chapters && (() => {
          const visibleLessons = activeFilter
            ? detail.lessons.filter(l =>
                activeFilter === "theory"   ? l.hasTheory   :
                activeFilter === "exercise" ? l.hasExercise :
                l.hasSubmit
              )
            : detail.lessons;
          return (
            <div style={{ padding:"12px", display:"flex", flexDirection:"column", gap:6 }}>
              {visibleLessons.map(lesson => (
                <LessonRow key={lesson.id} lesson={lesson} ctColor={ct.color} courseId={detail.id} />
              ))}
              {visibleLessons.length === 0 && (
                <div style={{ textAlign:"center", padding:"24px", fontSize:12, color:"#9ca3af" }}>
                  Không có bài học nào phù hợp với bộ lọc
                </div>
              )}
            </div>
          );
        })()}

        {/* Chapter list — THCS / THPT */}
        {chapters && (
          <div style={{ padding:"14px" }}>
            {chapters.map((chapter, idx) => (
              <ChapterSection
                key={idx}
                chapter={chapter}
                chapterIndex={idx}
                ctColor={ct.color}
                courseId={detail.id}
                collapsed={collapsed.has(idx)}
                onToggle={() => toggleChapter(idx)}
                activeFilter={activeFilter}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
