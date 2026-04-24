import {
  Play, PlayCircle, FileText, FileAudio,
  Image as ImageIcon, Presentation, Package,
} from "lucide-react";

/* ============================================================ */
/*  TYPES                                                        */
/* ============================================================ */

export type ContentType = "video" | "document" | "audio" | "image" | "presentation" | "scorm";

export interface Lesson {
  id: string;
  title: string;
  type: ContentType;
  duration: string;
  completed: boolean;
  locked: boolean;
  description: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface VideoQuiz {
  id: string;
  triggerPct: number;
  type: "single_choice" | "multiple_choice" | "true_false" | "fill_blank";
  question: string;
  options: string[];
  correctAnswers: number[];
  explanation: string;
  required: boolean;
  points: number;
}

export interface VideoBookmarkItem {
  id: string;
  pct: number;
  label: string;
  color: string;
}

export interface TimeComment {
  id: string;
  pct: number;
  user: string;
  initials: string;
  text: string;
  time: string;
  likes: number;
}

export interface NoteItem {
  id: string;
  timestamp: string;
  text: string;
  lessonId: string;
  createdAt: string;
}

export interface QAItem {
  id: string;
  user: string;
  initials: string;
  question: string;
  time: string;
  likes: number;
  replies: { user: string; initials: string; text: string; time: string }[];
}

/* ============================================================ */
/*  MOCK DATA                                                    */
/* ============================================================ */

export const courseModules: Module[] = [
  {
    id: "M1",
    title: "Module 1: Giới thiệu tổng quan",
    lessons: [
      { id: "L01", title: "Video: Giới thiệu khóa học & Mục tiêu", type: "video", duration: "12:30", completed: true, locked: false, description: "Tổng quan về nội dung, mục tiêu đào tạo và cách học hiệu quả nhất." },
      { id: "L02", title: "Tài liệu: Sổ tay Khung Năng lực Geleximco", type: "document", duration: "15 phút đọc", completed: true, locked: false, description: "Tài liệu PDF mô tả chi tiết khung năng lực lãnh đạo tại Tập đoàn Geleximco." },
      { id: "L03", title: "Audio: Podcast — CEO chia sẻ tầm nhìn", type: "audio", duration: "18:45", completed: true, locked: false, description: "Bài podcast ghi âm buổi chia sẻ từ Ban Giám đốc Tập đoàn về chiến lược đào tạo." },
    ],
  },
  {
    id: "M2",
    title: "Module 2: Năng lực Lãnh đạo Chiến lược",
    lessons: [
      { id: "L04", title: "Bài thuyết trình: Mô hình Lãnh đạo 5 cấp độ", type: "presentation", duration: "24 slides", completed: true, locked: false, description: "Bộ slide trình bày mô hình lãnh đạo 5 cấp độ John Maxwell ứng dụng tại Geleximco." },
      { id: "L05", title: "Video: Case Study — Ra quyết định tại ABBank", type: "video", duration: "25:10", completed: false, locked: false, description: "Phân tích case study thực tế về quy trình ra quyết định chiến lược tại ABBank." },
      { id: "L06", title: "Hình ảnh: Infographic — Quy trình Ra quyết định", type: "image", duration: "5 phút", completed: false, locked: false, description: "Bộ infographic minh họa quy trình ra quyết định chiến lược 6 bước." },
      { id: "L07", title: "Tài liệu: Phân tích SWOT — Mẫu dự án BĐS", type: "document", duration: "10 phút đọc", completed: false, locked: false, description: "Template phân tích SWOT dành cho các dự án BĐS trong Tập đoàn." },
    ],
  },
  {
    id: "M3",
    title: "Module 3: Kỹ năng Quản lý Thực chiến",
    lessons: [
      { id: "L08", title: "Video: Quản lý hiệu suất đội nhóm", type: "video", duration: "32:15", completed: false, locked: false, description: "Hướng dẫn xây dựng KPI, phản hồi liên tục và tạo động lực cho đội nhóm." },
      { id: "L09", title: "Audio: Phỏng vấn GĐ Xi măng Thăng Long", type: "audio", duration: "22:30", completed: false, locked: false, description: "Bài phỏng vấn về kinh nghiệm quản lý sản xuất và an toàn lao động." },
      { id: "L10", title: "Bài thuyết trình: OKR Framework cho Geleximco", type: "presentation", duration: "18 slides", completed: false, locked: false, description: "Slide trình bày cách áp dụng OKR (Objectives & Key Results) tại Geleximco." },
    ],
  },
  {
    id: "M4",
    title: "Module 4: E-Learning Chuyên sâu",
    lessons: [
      { id: "L11", title: "SCORM: Mô phỏng Quản lý Rủi ro Doanh nghiệp", type: "scorm", duration: "45 phút", completed: false, locked: false, description: "Module e-learning tương tác SCORM 2004 về quản lý rủi ro cho lãnh đạo cấp trung." },
      { id: "L12", title: "Video: Tổng kết & Bài học Rút ra", type: "video", duration: "15:00", completed: false, locked: false, description: "Tổng kết toàn bộ khóa học, các bài học chính và hướng dẫn áp dụng thực tế." },
    ],
  },
];

export const allLessons = courseModules.flatMap((m) => m.lessons);

export const VIDEO_QUIZZES: VideoQuiz[] = [
  {
    id: "VQ1", triggerPct: 12, type: "single_choice",
    question: "ABBank được thành lập vào năm nào và thuộc hệ sinh thái nào?",
    options: ["1993 — Vingroup", "2002 — Geleximco", "1996 — FPT", "1999 — Geleximco"],
    correctAnswers: [3], explanation: "ABBank (An Bình) thành lập năm 1999, là thành viên chiến lược của Tập đoàn Geleximco từ 2007.",
    required: true, points: 10,
  },
  {
    id: "VQ2", triggerPct: 28, type: "true_false",
    question: "Phân tích SWOT chỉ phù hợp với các doanh nghiệp lớn, không cần thiết cho chi nhánh cấp vùng.",
    options: ["Đúng", "Sai"],
    correctAnswers: [1], explanation: "SWOT có thể áp dụng ở mọi cấp độ — từ tập đoàn đến phòng ban. Tại ABBank, mỗi chi nhánh vùng đều thực hiện SWOT hàng quý.",
    required: true, points: 10,
  },
  {
    id: "VQ3", triggerPct: 45, type: "multiple_choice",
    question: "Trong quy trình ra quyết định 6 bước, bước nào thuộc giai đoạn \"Thu thập & Phân tích\"? (Chọn nhiều đáp án)",
    options: ["Nhận diện vấn đề", "Thu thập dữ liệu thị trường", "Phân tích rủi ro định lượng", "Triển khai hành động"],
    correctAnswers: [1, 2], explanation: "Thu thập dữ liệu và Phân tích rủi ro là 2 bước thuộc giai đoạn 2-3. Nhận diện (bước 1) và Triển khai (bước 5) nằm ở giai đoạn khác.",
    required: true, points: 15,
  },
  {
    id: "VQ4", triggerPct: 65, type: "single_choice",
    question: "Tỷ lệ nợ xấu của ABBank đã giảm bao nhiêu % sau khi áp dụng quy trình tái cấu trúc danh mục?",
    options: ["1.1%", "1.8%", "2.3%", "3.5%"],
    correctAnswers: [2], explanation: "Sau 18 tháng tái cấu trúc theo mô hình quyết định 6 bước, nợ xấu (NPL) giảm từ 4.2% xuống 1.9%, tương đương giảm 2.3 điểm phần trăm.",
    required: false, points: 10,
  },
  {
    id: "VQ5", triggerPct: 85, type: "fill_blank",
    question: "Hoàn thành: \"Nguyên tắc vàng khi ra quyết định chiến lược tại Geleximco là: Dữ liệu — ______ — Hành động\"",
    options: ["Đồng thuận", "Trực giác", "Thảo luận", "Phản biện"],
    correctAnswers: [0], explanation: "Quy trình 3 bước tại Geleximco: Dữ liệu (data-driven) → Đồng thuận (consensus) → Hành động (action). Đồng thuận là cầu nối giữa phân tích và thực thi.",
    required: true, points: 15,
  },
];

export const MOCK_TIME_COMMENTS: TimeComment[] = [
  { id: "TC1", pct: 8, user: "Nguyễn Văn Minh", initials: "NM", text: "Phần giới thiệu rất rõ ràng!", time: "2 ngày trước", likes: 4 },
  { id: "TC2", pct: 22, user: "Trần Thị Lan", initials: "TL", text: "Số liệu thị trường cập nhật tới Q4/2025 luôn 👍", time: "1 ngày trước", likes: 7 },
  { id: "TC3", pct: 38, user: "Phạm Đức Hùng", initials: "PH", text: "6 bước này có template Excel không ạ?", time: "5 giờ trước", likes: 2 },
  { id: "TC4", pct: 55, user: "Lê Hoàng Anh", initials: "LA", text: "Case study hay, áp dụng được cho Hải Phòng Thermal", time: "3 ngày trước", likes: 12 },
  { id: "TC5", pct: 78, user: "Vũ Thị Hương", initials: "VH", text: "Bài học rút ra rất thực tế cho ngành BĐS", time: "1 ngày trước", likes: 5 },
];

export const BOOKMARK_COLORS = ["#c8a84e", "#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f97316"];

export const mockNotes: NoteItem[] = [
  { id: "N1", timestamp: "02:15", text: "Khung năng lực 5 cấp độ — ghi nhớ mô hình này để áp dụng cho KPI Q2", lessonId: "L01", createdAt: "05/03/2026" },
  { id: "N2", timestamp: "08:30", text: "Quy trình ra quyết định 6 bước: Nhận diện → Thu thập → Phân tích → Lựa chọn → Thực hiện → Đánh giá", lessonId: "L01", createdAt: "05/03/2026" },
  { id: "N3", timestamp: "—", text: "Trang 12 — Bảng so sánh KPI theo khối rất hay, cần share với team", lessonId: "L02", createdAt: "06/03/2026" },
];

export const mockQA: QAItem[] = [
  {
    id: "QA1", user: "Nguyễn Thị Hà", initials: "NH", question: "Thầy ơi, mô hình 5 cấp độ có áp dụng được cho team dưới 10 người không ạ?", time: "2 ngày trước", likes: 5,
    replies: [{ user: "Phạm Anh Tuấn (GV)", initials: "PT", text: "Hoàn toàn được bạn nhé. Team nhỏ thì tập trung cấp 2-3 trước, sau đó mở rộng dần.", time: "1 ngày trước" }],
  },
  {
    id: "QA2", user: "Trần Văn Đức", initials: "TĐ", question: "Case study ABBank có slide riêng không ạ? Muốn present lại cho team ABBank.", time: "1 ngày trước", likes: 3,
    replies: [],
  },
];

/* ============================================================ */
/*  CONTENT TYPE ICON & LABEL MAP                               */
/* ============================================================ */

export const contentTypeConfig: Record<ContentType, { icon: typeof Play; label: string; color: string; bg: string }> = {
  video: { icon: PlayCircle, label: "Video", color: "text-red-500", bg: "bg-red-50" },
  document: { icon: FileText, label: "Tài liệu", color: "text-blue-600", bg: "bg-blue-50" },
  audio: { icon: FileAudio, label: "Audio", color: "text-purple-600", bg: "bg-purple-50" },
  image: { icon: ImageIcon, label: "Hình ảnh", color: "text-green-600", bg: "bg-green-50" },
  presentation: { icon: Presentation, label: "Thuyết trình", color: "text-orange-500", bg: "bg-orange-50" },
  scorm: { icon: Package, label: "SCORM", color: "text-teal-600", bg: "bg-teal-50" },
};