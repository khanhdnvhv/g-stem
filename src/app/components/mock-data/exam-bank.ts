/* ================================================================ */
/*  EXAM BANK — Ngân hàng câu hỏi + Kết quả thi STEM                  */
/*  Phục vụ STEMExamEcosystem, ExamCreateWizard, ExamDetail          */
/* ================================================================ */

import type { StemProgram } from "./types";

export type QuestionType = "single" | "multi" | "true_false";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface ExamQuestionOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface ExamQuestion {
  id: string;
  content: string;
  type: QuestionType;
  options: ExamQuestionOption[];
  points: number;
  programCode: StemProgram;
  difficulty: QuestionDifficulty;
  explanation?: string;
}

/* ── 30 câu hỏi — 6 câu × 5 CT ── */
export const EXAM_QUESTIONS: ExamQuestion[] = [
  /* ===== CT1 — Tích hợp nội môn ===== */
  {
    id: "Q-CT1-01", programCode: "CT1", type: "single", points: 1, difficulty: "easy",
    content: "Phương thức dạy học STEM tích hợp trong môn học (CT1) có đặc điểm gì?",
    options: [
      { id: "A", text: "Dạy bài học của môn theo hướng thực tiễn, ứng dụng", correct: true },
      { id: "B", text: "Bỏ hoàn toàn nội dung môn học gốc", correct: false },
      { id: "C", text: "Chỉ dạy vào buổi 2", correct: false },
      { id: "D", text: "Chỉ áp dụng cho môn Tin học", correct: false },
    ],
    explanation: "CT1 giữ nguyên nội dung môn, chỉ thay phương pháp dạy theo hướng STEM.",
  },
  {
    id: "Q-CT1-02", programCode: "CT1", type: "true_false", points: 1, difficulty: "easy",
    content: "CT1 yêu cầu giáo viên gắn bài giảng với bài học SGK của Bộ GD&ĐT.",
    options: [
      { id: "T", text: "Đúng", correct: true },
      { id: "F", text: "Sai", correct: false },
    ],
  },
  {
    id: "Q-CT1-03", programCode: "CT1", type: "single", points: 2, difficulty: "medium",
    content: "Trong giáo án 5512, hoạt động 'Khởi động' nhằm mục đích gì?",
    options: [
      { id: "A", text: "Tổng kết bài học", correct: false },
      { id: "B", text: "Tạo tình huống kích thích, gợi mở vấn đề", correct: true },
      { id: "C", text: "Kiểm tra cuối kỳ", correct: false },
      { id: "D", text: "Chấm điểm học sinh", correct: false },
    ],
  },
  {
    id: "Q-CT1-04", programCode: "CT1", type: "single", points: 2, difficulty: "medium",
    content: "Bài học STEM tích hợp môn Toán nên ưu tiên điều gì?",
    options: [
      { id: "A", text: "Học thuộc công thức", correct: false },
      { id: "B", text: "Vận dụng công thức giải bài toán thực tế", correct: true },
      { id: "C", text: "Chỉ làm bài tập trắc nghiệm", correct: false },
      { id: "D", text: "Không dùng công cụ tính toán", correct: false },
    ],
  },
  {
    id: "Q-CT1-05", programCode: "CT1", type: "multi", points: 3, difficulty: "hard",
    content: "Những năng lực nào CT1 thường phát triển? (chọn nhiều)",
    options: [
      { id: "A", text: "Giải quyết vấn đề", correct: true },
      { id: "B", text: "Sáng tạo", correct: true },
      { id: "C", text: "Lập trình robot nâng cao", correct: false },
      { id: "D", text: "Nghiên cứu khoa học độc lập", correct: false },
    ],
  },
  {
    id: "Q-CT1-06", programCode: "CT1", type: "single", points: 2, difficulty: "medium",
    content: "Giai đoạn 'Vận dụng' trong bài STEM CT1 nên kết nối với điều gì?",
    options: [
      { id: "A", text: "Tình huống thực tế trong cuộc sống", correct: true },
      { id: "B", text: "Bài kiểm tra học kỳ", correct: false },
      { id: "C", text: "Hoạt động ngoài giờ", correct: false },
      { id: "D", text: "Không cần kết nối gì", correct: false },
    ],
  },

  /* ===== CT2 — Liên môn ===== */
  {
    id: "Q-CT2-01", programCode: "CT2", type: "single", points: 1, difficulty: "easy",
    content: "Chủ đề STEM liên môn (CT2) cần có thành phần nào?",
    options: [
      { id: "A", text: "Một môn chủ đạo + các môn tích hợp", correct: true },
      { id: "B", text: "Chỉ duy nhất 1 môn", correct: false },
      { id: "C", text: "Không cần môn học cụ thể", correct: false },
      { id: "D", text: "Toàn bộ 13 môn của chương trình", correct: false },
    ],
  },
  {
    id: "Q-CT2-02", programCode: "CT2", type: "single", points: 2, difficulty: "medium",
    content: "Bài 'Đòn bẩy và công cơ học' tích hợp tốt nhất các môn nào?",
    options: [
      { id: "A", text: "Vật lý + Toán + Công nghệ", correct: true },
      { id: "B", text: "Ngữ văn + Lịch sử", correct: false },
      { id: "C", text: "Âm nhạc + Mỹ thuật", correct: false },
      { id: "D", text: "Tiếng Anh + GDCD", correct: false },
    ],
  },
  {
    id: "Q-CT2-03", programCode: "CT2", type: "true_false", points: 1, difficulty: "easy",
    content: "CT2 khuyến khích hoạt động nhóm để giải quyết vấn đề tích hợp.",
    options: [
      { id: "T", text: "Đúng", correct: true },
      { id: "F", text: "Sai", correct: false },
    ],
  },
  {
    id: "Q-CT2-04", programCode: "CT2", type: "single", points: 2, difficulty: "medium",
    content: "Công thức đòn bẩy cân bằng là?",
    options: [
      { id: "A", text: "F₁ × d₁ = F₂ × d₂", correct: true },
      { id: "B", text: "F₁ + d₁ = F₂ + d₂", correct: false },
      { id: "C", text: "F₁ / d₁ = F₂ / d₂", correct: false },
      { id: "D", text: "F₁ − F₂ = d₁ − d₂", correct: false },
    ],
  },
  {
    id: "Q-CT2-05", programCode: "CT2", type: "multi", points: 3, difficulty: "hard",
    content: "Sản phẩm tích hợp 'cầu giấy chịu lực' đánh giá những kỹ năng nào?",
    options: [
      { id: "A", text: "Tính toán tải trọng (Toán)", correct: true },
      { id: "B", text: "Thiết kế kết cấu (Kỹ thuật)", correct: true },
      { id: "C", text: "Thẩm mỹ trình bày (Mỹ thuật)", correct: true },
      { id: "D", text: "Phân tích thơ ca", correct: false },
    ],
  },
  {
    id: "Q-CT2-06", programCode: "CT2", type: "single", points: 2, difficulty: "medium",
    content: "Trong chủ đề liên môn, 'môn chủ đạo' đóng vai trò gì?",
    options: [
      { id: "A", text: "Cung cấp khung kiến thức chính của chủ đề", correct: true },
      { id: "B", text: "Không quan trọng, có thể bỏ", correct: false },
      { id: "C", text: "Chỉ để trang trí", correct: false },
      { id: "D", text: "Thay thế cho tất cả môn khác", correct: false },
    ],
  },

  /* ===== CT3 — Đổi mới sáng tạo ===== */
  {
    id: "Q-CT3-01", programCode: "CT3", type: "single", points: 1, difficulty: "easy",
    content: "CT3 được tổ chức như thế nào trong nhà trường?",
    options: [
      { id: "A", text: "Như môn học/hoạt động giáo dục buổi 2", correct: true },
      { id: "B", text: "Thay thế môn Toán", correct: false },
      { id: "C", text: "Chỉ tổ chức online", correct: false },
      { id: "D", text: "Không cần xếp thời khóa biểu", correct: false },
    ],
  },
  {
    id: "Q-CT3-02", programCode: "CT3", type: "true_false", points: 1, difficulty: "easy",
    content: "CT3 yêu cầu học sinh tạo ra sản phẩm cụ thể.",
    options: [
      { id: "T", text: "Đúng", correct: true },
      { id: "F", text: "Sai", correct: false },
    ],
  },
  {
    id: "Q-CT3-03", programCode: "CT3", type: "single", points: 2, difficulty: "medium",
    content: "Quy trình thiết kế kỹ thuật (Engineering Design) bắt đầu bằng bước nào?",
    options: [
      { id: "A", text: "Xác định vấn đề cần giải quyết", correct: true },
      { id: "B", text: "Bán sản phẩm", correct: false },
      { id: "C", text: "Viết báo cáo", correct: false },
      { id: "D", text: "Chấm điểm", correct: false },
    ],
  },
  {
    id: "Q-CT3-04", programCode: "CT3", type: "single", points: 2, difficulty: "medium",
    content: "'Prototype' (mẫu thử) trong CT3 có ý nghĩa gì?",
    options: [
      { id: "A", text: "Sản phẩm thử nghiệm để kiểm chứng ý tưởng", correct: true },
      { id: "B", text: "Sản phẩm hoàn thiện cuối cùng", correct: false },
      { id: "C", text: "Bản vẽ không thể thay đổi", correct: false },
      { id: "D", text: "Tài liệu lý thuyết", correct: false },
    ],
  },
  {
    id: "Q-CT3-05", programCode: "CT3", type: "multi", points: 3, difficulty: "hard",
    content: "Tiêu chí đánh giá sản phẩm sáng tạo CT3 gồm? (chọn nhiều)",
    options: [
      { id: "A", text: "Tính sáng tạo của ý tưởng", correct: true },
      { id: "B", text: "Tính khả thi", correct: true },
      { id: "C", text: "Khả năng hợp tác nhóm", correct: true },
      { id: "D", text: "Chiều cao của học sinh", correct: false },
    ],
  },
  {
    id: "Q-CT3-06", programCode: "CT3", type: "single", points: 2, difficulty: "medium",
    content: "Giai đoạn 'Trình bày & Phản hồi' của CT3 nhằm mục đích?",
    options: [
      { id: "A", text: "Chia sẻ sản phẩm và nhận góp ý cải thiện", correct: true },
      { id: "B", text: "Kết thúc không cần phản hồi", correct: false },
      { id: "C", text: "Chỉ giáo viên được nói", correct: false },
      { id: "D", text: "Cho điểm bí mật", correct: false },
    ],
  },

  /* ===== CT4 — Robotic, AI, IoT ===== */
  {
    id: "Q-CT4-01", programCode: "CT4", type: "single", points: 1, difficulty: "easy",
    content: "Cảm biến siêu âm HC-SR04 dùng để đo gì?",
    options: [
      { id: "A", text: "Khoảng cách tới vật cản", correct: true },
      { id: "B", text: "Nhiệt độ phòng", correct: false },
      { id: "C", text: "Độ ẩm không khí", correct: false },
      { id: "D", text: "Cường độ ánh sáng", correct: false },
    ],
    explanation: "HC-SR04 phát sóng siêu âm 40kHz, đo thời gian phản hồi để tính khoảng cách.",
  },
  {
    id: "Q-CT4-02", programCode: "CT4", type: "single", points: 1, difficulty: "easy",
    content: "Arduino UNO sử dụng nguồn điện an toàn nào?",
    options: [
      { id: "A", text: "USB 5V hoặc adapter ≤ 9V", correct: true },
      { id: "B", text: "Điện lưới 220V trực tiếp", correct: false },
      { id: "C", text: "Pin xe máy 12V cắm thẳng", correct: false },
      { id: "D", text: "Không cần nguồn", correct: false },
    ],
  },
  {
    id: "Q-CT4-03", programCode: "CT4", type: "true_false", points: 1, difficulty: "easy",
    content: "Teachable Machine là công cụ giúp train mô hình AI đơn giản không cần code.",
    options: [
      { id: "T", text: "Đúng", correct: true },
      { id: "F", text: "Sai", correct: false },
    ],
  },
  {
    id: "Q-CT4-04", programCode: "CT4", type: "single", points: 2, difficulty: "medium",
    content: "Đoạn code: if (d < 20) turnLeft(); else moveForward(); — robot làm gì khi d = 15?",
    options: [
      { id: "A", text: "Rẽ trái (turnLeft)", correct: true },
      { id: "B", text: "Đi thẳng (moveForward)", correct: false },
      { id: "C", text: "Dừng lại", correct: false },
      { id: "D", text: "Quay đầu 180°", correct: false },
    ],
  },
  {
    id: "Q-CT4-05", programCode: "CT4", type: "multi", points: 3, difficulty: "hard",
    content: "Lưu ý an toàn khi làm việc với mạch IoT? (chọn nhiều)",
    options: [
      { id: "A", text: "Kiểm tra cực +/− trước khi cắm", correct: true },
      { id: "B", text: "Tháo nguồn trước khi thay đổi mạch", correct: true },
      { id: "C", text: "Không sờ đầu mỏ hàn nóng", correct: true },
      { id: "D", text: "Cắm Arduino vào ổ điện 220V", correct: false },
    ],
  },
  {
    id: "Q-CT4-06", programCode: "CT4", type: "single", points: 2, difficulty: "medium",
    content: "Cảm biến DHT11 đo được những đại lượng nào?",
    options: [
      { id: "A", text: "Nhiệt độ và độ ẩm", correct: true },
      { id: "B", text: "Khoảng cách và tốc độ", correct: false },
      { id: "C", text: "Âm thanh và ánh sáng", correct: false },
      { id: "D", text: "Trọng lượng và áp suất", correct: false },
    ],
  },

  /* ===== CT5 — Nghiên cứu khoa học ===== */
  {
    id: "Q-CT5-01", programCode: "CT5", type: "single", points: 1, difficulty: "easy",
    content: "Bước đầu tiên của quy trình nghiên cứu khoa học là?",
    options: [
      { id: "A", text: "Đặt câu hỏi nghiên cứu", correct: true },
      { id: "B", text: "Viết kết luận", correct: false },
      { id: "C", text: "Công bố bài báo", correct: false },
      { id: "D", text: "Nhận giải thưởng", correct: false },
    ],
  },
  {
    id: "Q-CT5-02", programCode: "CT5", type: "single", points: 2, difficulty: "medium",
    content: "Giả thuyết nghiên cứu tốt cần có đặc điểm gì?",
    options: [
      { id: "A", text: "Có thể kiểm chứng được bằng thực nghiệm", correct: true },
      { id: "B", text: "Không thể kiểm chứng", correct: false },
      { id: "C", text: "Luôn luôn đúng", correct: false },
      { id: "D", text: "Không liên quan câu hỏi NC", correct: false },
    ],
  },
  {
    id: "Q-CT5-03", programCode: "CT5", type: "true_false", points: 1, difficulty: "easy",
    content: "Biến độc lập là biến mà nhà nghiên cứu chủ động thay đổi.",
    options: [
      { id: "T", text: "Đúng", correct: true },
      { id: "F", text: "Sai", correct: false },
    ],
  },
  {
    id: "Q-CT5-04", programCode: "CT5", type: "single", points: 2, difficulty: "medium",
    content: "Trong thí nghiệm so sánh, 'nhóm đối chứng' có vai trò gì?",
    options: [
      { id: "A", text: "Làm chuẩn so sánh với nhóm thực nghiệm", correct: true },
      { id: "B", text: "Không cần thiết", correct: false },
      { id: "C", text: "Chịu mọi tác động của biến độc lập", correct: false },
      { id: "D", text: "Là nhóm cho kết quả tốt nhất", correct: false },
    ],
  },
  {
    id: "Q-CT5-05", programCode: "CT5", type: "multi", points: 3, difficulty: "hard",
    content: "Đầu ra của một đề tài NCKH cấp THPT có thể là? (chọn nhiều)",
    options: [
      { id: "A", text: "Bài báo khoa học", correct: true },
      { id: "B", text: "Poster trình bày", correct: true },
      { id: "C", text: "Dự thi KH-KT cấp tỉnh/quốc gia", correct: true },
      { id: "D", text: "Không cần đầu ra gì", correct: false },
    ],
  },
  {
    id: "Q-CT5-06", programCode: "CT5", type: "single", points: 2, difficulty: "medium",
    content: "Mục 'Tổng quan tài liệu' trong báo cáo NCKH nhằm?",
    options: [
      { id: "A", text: "Tổng hợp nghiên cứu trước, tìm khoảng trống nghiên cứu", correct: true },
      { id: "B", text: "Liệt kê tên học sinh", correct: false },
      { id: "C", text: "Trình bày kết quả thí nghiệm", correct: false },
      { id: "D", text: "Quảng cáo sản phẩm", correct: false },
    ],
  },
];

/* ── Kết quả thi (cho kỳ thi đã chấm) ── */
export interface ExamResult {
  examId: string;
  studentName: string;
  studentClass: string;
  score: number;        // thang 10
  correctCount: number;
  totalQuestions: number;
  submittedAt: string;
}

/* Kết quả mock cho EX-003 (kỳ thi graded — CT4 Robotic) */
export const EXAM_RESULTS: ExamResult[] = [
  { examId: "EX-003", studentName: "Nguyễn Văn An",   studentClass: "10A1", score: 9.0, correctCount: 27, totalQuestions: 30, submittedAt: "2026-04-20T14:45:00Z" },
  { examId: "EX-003", studentName: "Trần Thị Bình",   studentClass: "10A1", score: 8.3, correctCount: 25, totalQuestions: 30, submittedAt: "2026-04-20T14:50:00Z" },
  { examId: "EX-003", studentName: "Lê Minh Cường",   studentClass: "10A2", score: 7.7, correctCount: 23, totalQuestions: 30, submittedAt: "2026-04-20T14:48:00Z" },
  { examId: "EX-003", studentName: "Phạm Thu Dung",   studentClass: "10A2", score: 9.7, correctCount: 29, totalQuestions: 30, submittedAt: "2026-04-20T14:30:00Z" },
  { examId: "EX-003", studentName: "Hoàng Văn Em",    studentClass: "10A1", score: 6.0, correctCount: 18, totalQuestions: 30, submittedAt: "2026-04-20T14:58:00Z" },
  { examId: "EX-003", studentName: "Vũ Thị Phương",   studentClass: "10A3", score: 8.7, correctCount: 26, totalQuestions: 30, submittedAt: "2026-04-20T14:42:00Z" },
  { examId: "EX-003", studentName: "Đỗ Minh Quân",    studentClass: "10A3", score: 5.3, correctCount: 16, totalQuestions: 30, submittedAt: "2026-04-20T15:00:00Z" },
  { examId: "EX-003", studentName: "Bùi Thị Hoa",     studentClass: "10A2", score: 7.0, correctCount: 21, totalQuestions: 30, submittedAt: "2026-04-20T14:55:00Z" },
  { examId: "EX-003", studentName: "Ngô Văn Khôi",    studentClass: "10A1", score: 8.0, correctCount: 24, totalQuestions: 30, submittedAt: "2026-04-20T14:47:00Z" },
  { examId: "EX-003", studentName: "Dương Thị Lan",   studentClass: "10A3", score: 9.3, correctCount: 28, totalQuestions: 30, submittedAt: "2026-04-20T14:38:00Z" },
  { examId: "EX-003", studentName: "Trịnh Văn Minh",  studentClass: "10A2", score: 4.7, correctCount: 14, totalQuestions: 30, submittedAt: "2026-04-20T15:00:00Z" },
  { examId: "EX-003", studentName: "Lý Thị Nga",      studentClass: "10A1", score: 7.3, correctCount: 22, totalQuestions: 30, submittedAt: "2026-04-20T14:52:00Z" },
];

/* ── Helpers ── */
export function getQuestionsByProgram(code: StemProgram): ExamQuestion[] {
  return EXAM_QUESTIONS.filter((q) => q.programCode === code);
}

export function getExamResults(examId: string): ExamResult[] {
  return EXAM_RESULTS.filter((r) => r.examId === examId);
}

export const QUESTION_DIFFICULTY_META: Record<QuestionDifficulty, { label: string; color: string }> = {
  easy:   { label: "Dễ",         color: "#16a34a" },
  medium: { label: "Trung bình", color: "#c8a84e" },
  hard:   { label: "Khó",        color: "#dc2626" },
};
