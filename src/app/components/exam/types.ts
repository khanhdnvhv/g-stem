// ============================================================
// EXAM SYSTEM — Types, Constants & Comprehensive Mock Data
// Geleximco LMS — World-class Examination System
// ============================================================

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "short_answer"
  | "matching"
  | "ordering"
  | "hotspot"
  | "matrix"
  | "code_eval"
  | "listening"
  | "case_study";

export type DifficultyLevel = "easy" | "medium" | "hard" | "expert";
export type ExamStatus = "not_started" | "in_progress" | "submitted" | "passed" | "failed" | "grading";
export type ExamType = "quiz" | "midterm" | "final" | "certification" | "practice" | "survey";

export interface MatchingPair { id: string; left: string; right: string; }
export interface HotspotArea { id: string; x: number; y: number; w: number; h: number; label: string; }
export interface MatrixRow { id: string; label: string; }
export interface MatrixCol { id: string; label: string; }
export interface CaseStudySubQ { id: string; question: string; type: "single_choice" | "multiple_choice" | "short_answer"; options?: string[]; correctAnswers?: number[]; correctText?: string; points: number; }

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  question: string;
  hint?: string;
  difficulty: DifficultyLevel;
  points: number;
  category: string;
  tags: string[];
  timeEstimate: number; // seconds
  // Single/Multiple choice
  options?: string[];
  correctAnswers?: number[];
  // Fill-blank
  blanks?: { id: string; answer: string; alternatives?: string[] }[];
  // Matching
  matchingPairs?: MatchingPair[];
  // Ordering
  orderItems?: string[];
  correctOrder?: number[];
  // Hotspot
  hotspotImage?: string;
  hotspotAreas?: HotspotArea[];
  // Matrix
  matrixRows?: MatrixRow[];
  matrixCols?: MatrixCol[];
  matrixCorrect?: Record<string, string>; // rowId -> colId
  // Case study
  caseStudyContext?: string;
  subQuestions?: CaseStudySubQ[];
  // Code eval
  codeLanguage?: string;
  codeTemplate?: string;
  expectedOutput?: string;
  // Common
  explanation?: string;
  referenceUrl?: string;
  mediaUrl?: string;
}

export interface ExamSection {
  id: string;
  title: string;
  description?: string;
  questions: string[]; // question ids
  timeLimit?: number; // minutes, optional per-section
  shuffleQuestions?: boolean;
}

export interface Exam {
  id: string;
  title: string;
  subtitle?: string;
  courseId: string;
  courseName: string;
  type: ExamType;
  description: string;
  instructions: string[];
  sections: ExamSection[];
  totalQuestions: number;
  totalPoints: number;
  duration: number; // minutes
  passingScore: number; // percentage
  passingPoints?: number;
  maxAttempts: number;
  attemptsUsed: number;
  bestScore: number | null;
  status: ExamStatus;
  dueDate: string;
  category: string;
  createdBy: string;
  createdByAvatar: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  showExplanation: boolean;
  allowReview: boolean;
  allowBacktrack: boolean;
  allowCalculator: boolean;
  allowNotepad: boolean;
  proctoringEnabled: boolean;
  webcamRequired: boolean;
  antiCheat: boolean;
  difficulty: DifficultyLevel;
  tags: string[];
  estimatedTime: number;
  avgCompletionTime?: number;
  avgScore?: number;
  passRate?: number;
  totalAttempts?: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  startedAt: string;
  completedAt?: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // seconds
  answers: Record<string, any>;
  flaggedQuestions: string[];
  confidenceLevels: Record<string, number>;
  tabSwitches: number;
  questionTimes: Record<string, number>; // question id -> seconds spent
}

// ─── Difficulty config ───
export const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; color: string; bg: string; stars: number }> = {
  easy: { label: "Cơ bản", color: "#22c55e", bg: "#22c55e15", stars: 1 },
  medium: { label: "Trung bình", color: "#f59e0b", bg: "#f59e0b15", stars: 2 },
  hard: { label: "Nâng cao", color: "#ef4444", bg: "#ef444415", stars: 3 },
  expert: { label: "Chuyên gia", color: "#8b5cf6", bg: "#8b5cf615", stars: 4 },
};

export const EXAM_TYPE_CONFIG: Record<ExamType, { label: string; color: string; bg: string; icon: string }> = {
  quiz: { label: "Kiểm tra nhanh", color: "#3b82f6", bg: "#3b82f610", icon: "⚡" },
  midterm: { label: "Giữa kỳ", color: "#f59e0b", bg: "#f59e0b10", icon: "📝" },
  final: { label: "Cuối khóa", color: "#990803", bg: "#99080310", icon: "🎓" },
  certification: { label: "Chứng chỉ", color: "#8b5cf6", bg: "#8b5cf610", icon: "🏅" },
  practice: { label: "Luyện tập", color: "#22c55e", bg: "#22c55e10", icon: "🎯" },
  survey: { label: "Khảo sát", color: "#06b6d4", bg: "#06b6d410", icon: "📊" },
};

export const QUESTION_TYPE_CONFIG: Record<QuestionType, { label: string; icon: string; color: string }> = {
  single_choice: { label: "Một đáp án", icon: "◉", color: "#3b82f6" },
  multiple_choice: { label: "Nhiều đáp án", icon: "☑", color: "#8b5cf6" },
  true_false: { label: "Đúng/Sai", icon: "⇌", color: "#22c55e" },
  fill_blank: { label: "Điền khuyết", icon: "▭", color: "#f59e0b" },
  short_answer: { label: "Tự luận", icon: "✎", color: "#ec4899" },
  matching: { label: "Nối cặp", icon: "⟷", color: "#06b6d4" },
  ordering: { label: "Sắp xếp", icon: "↕", color: "#14b8a6" },
  hotspot: { label: "Điểm nóng", icon: "◎", color: "#ef4444" },
  matrix: { label: "Ma trận", icon: "▦", color: "#6366f1" },
  code_eval: { label: "Code", icon: "⌨", color: "#1e293b" },
  listening: { label: "Nghe", icon: "🎧", color: "#d946ef" },
  case_study: { label: "Case Study", icon: "📋", color: "#990803" },
};

// ─── Comprehensive Question Bank ───
export const QUESTION_BANK: ExamQuestion[] = [
  // ── SECTION: Leadership & Management ──
  {
    id: "EQ001", type: "single_choice", difficulty: "medium", points: 2, category: "Kỹ năng Lãnh đạo", tags: ["leadership", "strategy"], timeEstimate: 60,
    question: "Theo mô hình Servant Leadership, đâu là ưu tiên hàng đầu của nhà lãnh đạo?",
    options: ["Đạt mục tiêu kinh doanh bằng mọi giá", "Phục vụ và phát triển đội ngũ nhân viên", "Xây dựng quyền lực cá nhân trong tổ chức", "Tuân thủ nghiêm ngặt quy trình và thủ tục"],
    correctAnswers: [1],
    explanation: "Servant Leadership đặt trọng tâm vào phục vụ nhân viên, giúp họ phát triển tối đa năng lực. Khi đội ngũ mạnh, kết quả kinh doanh sẽ tự cải thiện.",
    hint: "Hãy nghĩ về triết lý 'Phục vụ để dẫn dắt'",
  },
  {
    id: "EQ002", type: "multiple_choice", difficulty: "hard", points: 3, category: "Kỹ năng Lãnh đạo", tags: ["leadership", "competency"], timeEstimate: 90,
    question: "Trong Khung năng lực Geleximco, những nhóm năng lực nào thuộc năng lực LÕI (Core Competencies)?",
    options: ["Tư duy chiến lược", "Kỹ năng lập trình", "Lãnh đạo con người", "Quản lý & Điều hành", "Giao tiếp & Ảnh hưởng", "Sửa chữa máy móc"],
    correctAnswers: [0, 2, 3, 4],
    explanation: "5 nhóm năng lực lõi: Tư duy chiến lược, Quản lý & Điều hành, Lãnh đạo con người, Giao tiếp & Ảnh hưởng, Học hỏi & Phát triển bản thân.",
  },
  {
    id: "EQ003", type: "true_false", difficulty: "easy", points: 1, category: "Kỹ năng Lãnh đạo", tags: ["leadership"], timeEstimate: 30,
    question: "Phong cách lãnh đạo Laissez-faire (tự do) luôn là phong cách hiệu quả nhất trong mọi tình huống.",
    options: ["Đúng", "Sai"],
    correctAnswers: [1],
    explanation: "Không có phong cách lãnh đạo nào 'hoàn hảo' cho mọi tình huống. Laissez-faire phù hợp khi đội ngũ có năng lực cao và tự chủ, nhưng kém hiệu quả trong tình huống khẩn cấp.",
  },
  {
    id: "EQ004", type: "fill_blank", difficulty: "medium", points: 2, category: "Quản trị Rủi ro", tags: ["risk", "finance"], timeEstimate: 60,
    question: "Hoàn thành công thức: Risk = ___(1)___ × ___(2)___. Trong quản trị rủi ro, rủi ro được tính bằng tích của hai yếu tố này.",
    blanks: [
      { id: "b1", answer: "Xác suất xảy ra", alternatives: ["Probability", "Likelihood", "Khả năng xảy ra"] },
      { id: "b2", answer: "Mức độ tác động", alternatives: ["Impact", "Severity", "Hậu quả"] },
    ],
    explanation: "Công thức cơ bản: Risk = Probability × Impact. Đây là nền tảng của mọi phương pháp đánh giá rủi ro.",
  },
  {
    id: "EQ005", type: "matching", difficulty: "medium", points: 4, category: "Quản trị Doanh nghiệp", tags: ["management", "geleximco"], timeEstimate: 120,
    question: "Nối mỗi đơn vị thành viên Geleximco với lĩnh vực kinh doanh tương ứng:",
    matchingPairs: [
      { id: "m1", left: "ABBank", right: "Tài chính — Ngân hàng" },
      { id: "m2", left: "KĐT Lê Trọng Tấn", right: "Bất động sản" },
      { id: "m3", left: "Thủy điện Quảng Ninh", right: "Năng lượng" },
      { id: "m4", left: "Xi măng Thăng Long", right: "Vật liệu xây dựng" },
      { id: "m5", left: "Khoáng sản Bắc Kạn", right: "Khai khoáng" },
    ],
    explanation: "Tập đoàn Geleximco hoạt động trong 10 lĩnh vực kinh doanh chính, với 14 công ty thành viên trải dài nhiều ngành nghề.",
  },
  {
    id: "EQ006", type: "ordering", difficulty: "hard", points: 3, category: "Quản lý Dự án", tags: ["pmp", "project"], timeEstimate: 90,
    question: "Sắp xếp các giai đoạn quản lý dự án theo chuẩn PMI theo đúng thứ tự:",
    orderItems: ["Thực thi (Executing)", "Khởi tạo (Initiating)", "Giám sát & Kiểm soát (Monitoring)", "Kết thúc (Closing)", "Lập kế hoạch (Planning)"],
    correctOrder: [1, 4, 0, 2, 3],
    explanation: "5 nhóm quy trình PMI: Initiating → Planning → Executing → Monitoring & Controlling → Closing.",
  },
  {
    id: "EQ007", type: "matrix", difficulty: "medium", points: 5, category: "Đánh giá 360°", tags: ["assessment", "hr"], timeEstimate: 120,
    question: "Đánh giá mức độ quan trọng của từng năng lực đối với cấp Trưởng phòng tại Geleximco:",
    matrixRows: [
      { id: "r1", label: "Tư duy chiến lược" },
      { id: "r2", label: "Quản lý đội nhóm" },
      { id: "r3", label: "Kỹ năng giao tiếp" },
      { id: "r4", label: "Chuyên môn kỹ thuật" },
    ],
    matrixCols: [
      { id: "c1", label: "Rất quan trọng" },
      { id: "c2", label: "Quan trọng" },
      { id: "c3", label: "Bình thường" },
      { id: "c4", label: "Ít quan trọng" },
    ],
    matrixCorrect: { r1: "c2", r2: "c1", r3: "c1", r4: "c2" },
    explanation: "Với Trưởng phòng, Quản lý đội nhóm và Giao tiếp là rất quan trọng; Tư duy chiến lược và Chuyên môn ở mức quan trọng.",
  },
  {
    id: "EQ008", type: "case_study", difficulty: "expert", points: 10, category: "Quản trị Chiến lược", tags: ["strategy", "case-study"], timeEstimate: 300,
    question: "Case Study: Chiến lược M&A của Geleximco",
    caseStudyContext: `Năm 2025, Tập đoàn Geleximco đang cân nhắc mua lại một công ty năng lượng tái tạo có công suất 200MW điện gió. Giá chào bán: 5,200 tỷ VNĐ. Công ty mục tiêu đang EBITDA dương (320 tỷ/năm) nhưng free cash flow âm do đang đầu tư mở rộng. Tỷ lệ nợ/vốn chủ sở hữu: 2.8x. Thị trường năng lượng tái tạo dự báo tăng trưởng 25%/năm trong 5 năm tới.\n\nDữ liệu bổ sung:\n• Chi phí vốn bình quân (WACC) của Geleximco: 12%\n• Thuế suất TNDN: 20%\n• Synergy dự kiến: tiết kiệm 80 tỷ VNĐ/năm từ tối ưu chuỗi cung ứng\n• PPA (Power Purchase Agreement) đã ký: 15 năm với EVN`,
    subQuestions: [
      { id: "sq1", question: "Dựa trên EBITDA multiple, định giá của công ty mục tiêu ở mức bao nhiêu lần?", type: "single_choice", options: ["12.5x", "16.25x", "18.75x", "21x"], correctAnswers: [1], points: 3 },
      { id: "sq2", question: "Những rủi ro chính nào Geleximco cần đánh giá? (Chọn tất cả phù hợp)", type: "multiple_choice", options: ["Rủi ro tỷ giá", "Rủi ro chính sách năng lượng", "Rủi ro công nghệ lỗi thời", "Rủi ro thay đổi giá FIT/PPA", "Rủi ro thiên tai ảnh hưởng sản lượng"], correctAnswers: [1, 2, 3, 4], points: 4 },
      { id: "sq3", question: "Đề xuất ngắn gọn chiến lược hậu M&A (post-merger integration) cho Geleximco:", type: "short_answer", points: 3 },
    ],
    explanation: "Định giá: 5200/320 = 16.25x EBITDA. Cần đánh giá đầy đủ các rủi ro ngành năng lượng và xây dựng kế hoạch tích hợp hậu M&A.",
  },
  {
    id: "EQ009", type: "single_choice", difficulty: "easy", points: 1, category: "An toàn Lao động", tags: ["safety"], timeEstimate: 30,
    question: "Khi phát hiện sự cố về an toàn lao động tại công trường, việc đầu tiên cần làm là gì?",
    options: ["Tiếp tục công việc và báo cáo sau", "Dừng công việc ngay và đảm bảo an toàn cho mọi người", "Chụp ảnh để báo cáo", "Gọi điện cho quản lý"],
    correctAnswers: [1],
    explanation: "Quy tắc số 1: Luôn ưu tiên an toàn con người. Dừng công việc, đảm bảo khu vực an toàn trước khi thực hiện các bước tiếp theo.",
  },
  {
    id: "EQ010", type: "single_choice", difficulty: "medium", points: 2, category: "Chuyển đổi số", tags: ["digital", "ai"], timeEstimate: 60,
    question: "Trong chuyển đổi số doanh nghiệp, 'Digital Twin' là gì?",
    options: ["Bản sao kỹ thuật số của một đối tượng/quy trình vật lý", "Hai hệ thống IT chạy song song để backup", "Phiên bản mobile của ứng dụng desktop", "Chiến lược sử dụng 2 nền tảng cloud cùng lúc"],
    correctAnswers: [0],
    explanation: "Digital Twin là bản sao kỹ thuật số mô phỏng chính xác đối tượng vật lý, cho phép theo dõi, phân tích và tối ưu hóa trong thời gian thực.",
  },
  {
    id: "EQ011", type: "short_answer", difficulty: "hard", points: 5, category: "Kỹ năng Lãnh đạo", tags: ["leadership", "essay"], timeEstimate: 180,
    question: "Phân tích ngắn gọn (100-200 từ): Trong bối cảnh VUCA, nhà lãnh đạo Geleximco cần thay đổi mindset như thế nào để dẫn dắt tổ chức thành công?",
    explanation: "Câu trả lời cần đề cập: Agile mindset, chấp nhận uncertainty, ra quyết định nhanh với dữ liệu không đầy đủ, xây dựng resilience, liên tục học hỏi.",
  },
  {
    id: "EQ012", type: "single_choice", difficulty: "medium", points: 2, category: "Tài chính", tags: ["finance", "analysis"], timeEstimate: 60,
    question: "Chỉ số ROE (Return on Equity) 18% của ABBank năm 2025 có nghĩa là gì?",
    options: ["Mỗi 100 đồng doanh thu tạo ra 18 đồng lợi nhuận", "Mỗi 100 đồng vốn chủ sở hữu tạo ra 18 đồng lợi nhuận ròng", "Tỷ lệ nợ xấu là 18%", "Tăng trưởng tín dụng đạt 18%"],
    correctAnswers: [1],
    explanation: "ROE = Lợi nhuận ròng / Vốn chủ sở hữu. ROE 18% nghĩa là mỗi 100 đồng vốn CSH tạo ra 18 đồng lợi nhuận ròng.",
  },
  {
    id: "EQ013", type: "multiple_choice", difficulty: "medium", points: 3, category: "ESG", tags: ["esg", "sustainability"], timeEstimate: 75,
    question: "Trong framework ESG mà Geleximco đang triển khai, những tiêu chí nào thuộc nhóm 'Social' (Xã hội)?",
    options: ["Giảm phát thải carbon", "An toàn sức khỏe lao động", "Đa dạng & Hòa nhập (D&I)", "Phát triển cộng đồng địa phương", "Quản trị rủi ro", "Bảo vệ quyền lợi người lao động"],
    correctAnswers: [1, 2, 3, 5],
    explanation: "Social trong ESG bao gồm: điều kiện lao động, sức khỏe & an toàn, D&I, phát triển cộng đồng, quyền con người. 'Giảm phát thải' thuộc Environment, 'Quản trị rủi ro' thuộc Governance.",
  },
  {
    id: "EQ014", type: "ordering", difficulty: "medium", points: 3, category: "Đánh giá Đào tạo", tags: ["training", "kirkpatrick"], timeEstimate: 60,
    question: "Sắp xếp 4 cấp độ đánh giá hiệu quả đào tạo theo mô hình Kirkpatrick từ thấp đến cao:",
    orderItems: ["Kết quả kinh doanh (Results)", "Phản ứng học viên (Reaction)", "Hành vi thay đổi (Behavior)", "Kiến thức học được (Learning)"],
    correctOrder: [1, 3, 2, 0],
    explanation: "Kirkpatrick: Level 1 Reaction → Level 2 Learning → Level 3 Behavior → Level 4 Results.",
  },
  {
    id: "EQ015", type: "true_false", difficulty: "easy", points: 1, category: "Chuyển đổi số", tags: ["digital"], timeEstimate: 30,
    question: "SCORM 2004 là chuẩn đóng gói nội dung e-learning cho phép theo dõi tiến độ và kết quả học tập.",
    options: ["Đúng", "Sai"],
    correctAnswers: [0],
    explanation: "SCORM (Sharable Content Object Reference Model) 2004 là chuẩn quốc tế cho e-learning, hỗ trợ tracking completion, score, và sequencing.",
  },
  // Additional filler questions
  {
    id: "EQ016", type: "single_choice", difficulty: "hard", points: 3, category: "Tài chính", tags: ["finance", "valuation"], timeEstimate: 90,
    question: "Trong phương pháp DCF, khi WACC tăng từ 10% lên 15%, giá trị doanh nghiệp sẽ:",
    options: ["Tăng lên đáng kể", "Giảm đi đáng kể", "Không thay đổi", "Phụ thuộc vào terminal value"],
    correctAnswers: [1],
    explanation: "WACC tăng → chiết khấu mạnh hơn → giá trị hiện tại (PV) của dòng tiền tương lai giảm → giá trị doanh nghiệp giảm.",
  },
  {
    id: "EQ017", type: "single_choice", difficulty: "easy", points: 1, category: "Kỹ năng Mềm", tags: ["communication"], timeEstimate: 45,
    question: "Trong giao tiếp, quy tắc 7-38-55 của Albert Mehrabian cho biết điều gì?",
    options: ["7% thời gian nên dành cho lắng nghe", "Lời nói chiếm 7%, giọng nói 38%, ngôn ngữ cơ thể 55% trong truyền đạt cảm xúc", "7 phút đầu tiên quyết định 38-55% ấn tượng", "Cần 7 lần lặp lại để nhớ 38-55% thông tin"],
    correctAnswers: [1],
    explanation: "Quy tắc Mehrabian: Words (7%) + Tone of voice (38%) + Body language (55%) = tổng thông điệp cảm xúc.",
  },
  {
    id: "EQ018", type: "fill_blank", difficulty: "medium", points: 2, category: "Quản lý Dự án", tags: ["agile"], timeEstimate: 60,
    question: "Trong Agile Scrum, một ___(1)___ thường kéo dài 1-4 tuần, và cuộc họp ___(2)___ diễn ra hàng ngày trong 15 phút.",
    blanks: [
      { id: "b1", answer: "Sprint", alternatives: ["sprint", "iteration"] },
      { id: "b2", answer: "Daily Standup", alternatives: ["Daily Scrum", "standup", "daily standup", "daily scrum"] },
    ],
    explanation: "Sprint là đơn vị thời gian trong Scrum (1-4 tuần). Daily Standup/Daily Scrum là cuộc họp đồng bộ hàng ngày 15 phút.",
  },
  {
    id: "EQ019", type: "single_choice", difficulty: "medium", points: 2, category: "Quản trị Rủi ro", tags: ["risk", "compliance"], timeEstimate: 60,
    question: "Basel III yêu cầu tỷ lệ an toàn vốn tối thiểu (CAR) cho ngân hàng là bao nhiêu?",
    options: ["4%", "6%", "8%", "10.5%"],
    correctAnswers: [2],
    explanation: "Basel III yêu cầu CAR tối thiểu 8%, bao gồm Tier 1 Capital 6% (trong đó CET1 4.5%) và Tier 2 Capital 2%. Với capital buffers, tổng có thể lên 10.5%+.",
  },
  {
    id: "EQ020", type: "single_choice", difficulty: "easy", points: 1, category: "Văn hóa Doanh nghiệp", tags: ["culture"], timeEstimate: 30,
    question: "Giá trị cốt lõi nào KHÔNG thuộc bộ giá trị văn hóa doanh nghiệp Geleximco?",
    options: ["Chính trực & Minh bạch", "Sáng tạo & Đổi mới", "Lợi nhuận trước hết", "Phát triển Bền vững"],
    correctAnswers: [2],
    explanation: "'Lợi nhuận trước hết' không phải giá trị văn hóa. Geleximco đề cao: Chính trực, Sáng tạo, Phát triển bền vững, Tinh thần đội nhóm.",
  },
];

// ─── Mock Exams ───
export const MOCK_EXAMS: Exam[] = [
  {
    id: "EX001",
    title: "Kiểm tra Năng lực Lãnh đạo Q1/2026",
    subtitle: "Đánh giá toàn diện năng lực quản lý cấp trung",
    courseId: "C001", courseName: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung",
    type: "final",
    description: "Bài thi đánh giá năng lực lãnh đạo tổng hợp dành cho cán bộ quy hoạch cấp Trưởng phòng trở lên. Bao gồm 20 câu hỏi đa dạng từ trắc nghiệm, tình huống đến case study.",
    instructions: [
      "Thời gian làm bài: 45 phút. Hệ thống sẽ tự động nộp bài khi hết giờ.",
      "Không được phép chuyển tab hoặc mở ứng dụng khác — hệ thống sẽ ghi nhận.",
      "Cho phép quay lại câu trước để chỉnh sửa đáp án.",
      "Sử dụng nút 'Đánh dấu' để gắn flag các câu cần xem lại.",
      "Bài thi yêu cầu bật webcam trong suốt quá trình làm bài.",
      "Điểm đạt tối thiểu: 70%. Số lần thi tối đa: 2 lần.",
    ],
    sections: [
      { id: "S1", title: "Phần I: Trắc nghiệm Kiến thức", description: "Câu hỏi trắc nghiệm về lý thuyết lãnh đạo", questions: ["EQ001", "EQ002", "EQ003", "EQ009", "EQ010", "EQ012", "EQ015", "EQ017", "EQ019", "EQ020"] },
      { id: "S2", title: "Phần II: Vận dụng & Phân tích", description: "Câu hỏi đòi hỏi phân tích và tổng hợp", questions: ["EQ004", "EQ005", "EQ006", "EQ007", "EQ013", "EQ014", "EQ016", "EQ018"] },
      { id: "S3", title: "Phần III: Tình huống & Case Study", description: "Phân tích tình huống thực tế Geleximco", questions: ["EQ008", "EQ011"] },
    ],
    totalQuestions: 20, totalPoints: 55, duration: 45, passingScore: 70,
    maxAttempts: 2, attemptsUsed: 0, bestScore: null, status: "not_started",
    dueDate: "2026-03-25", category: "Kỹ năng Lãnh đạo",
    createdBy: "TS. Nguyễn Văn Minh", createdByAvatar: "NM",
    shuffleQuestions: true, shuffleOptions: true, showResults: true, showExplanation: true,
    allowReview: true, allowBacktrack: true, allowCalculator: true, allowNotepad: true,
    proctoringEnabled: true, webcamRequired: true, antiCheat: true,
    difficulty: "hard", tags: ["leadership", "management", "geleximco"],
    estimatedTime: 40, avgCompletionTime: 38, avgScore: 72, passRate: 68, totalAttempts: 342,
  },
  {
    id: "EX002",
    title: "Quiz nhanh: An toàn Lao động",
    subtitle: "Kiểm tra kiến thức ATLĐ bắt buộc hàng quý",
    courseId: "C002", courseName: "An toàn Lao động trong Xây dựng & Khai khoáng",
    type: "quiz",
    description: "Bài kiểm tra nhanh kiến thức an toàn lao động bắt buộc cho tất cả nhân sự khối sản xuất và xây dựng.",
    instructions: [
      "Thời gian: 15 phút, 10 câu trắc nghiệm.",
      "Điểm đạt: 80%. Được thi lại tối đa 5 lần.",
      "Có thể xem giải thích sau khi nộp bài.",
    ],
    sections: [
      { id: "S1", title: "An toàn Lao động", questions: ["EQ009", "EQ003", "EQ015", "EQ020", "EQ001", "EQ010", "EQ017", "EQ012", "EQ019", "EQ013"] },
    ],
    totalQuestions: 10, totalPoints: 18, duration: 15, passingScore: 80,
    maxAttempts: 5, attemptsUsed: 2, bestScore: 75, status: "failed",
    dueDate: "2026-03-20", category: "An toàn Lao động",
    createdBy: "KS. Trần Đức Mạnh", createdByAvatar: "TM",
    shuffleQuestions: true, shuffleOptions: true, showResults: true, showExplanation: true,
    allowReview: true, allowBacktrack: true, allowCalculator: false, allowNotepad: false,
    proctoringEnabled: false, webcamRequired: false, antiCheat: false,
    difficulty: "easy", tags: ["safety", "compliance"],
    estimatedTime: 12, avgCompletionTime: 10, avgScore: 82, passRate: 85, totalAttempts: 1240,
  },
  {
    id: "EX003",
    title: "Thi Chứng chỉ Phân tích Tài chính",
    subtitle: "Certification Exam — CFA Prep Level I",
    courseId: "C003", courseName: "Phân tích Tài chính Doanh nghiệp",
    type: "certification",
    description: "Bài thi chứng chỉ nội bộ dành cho cán bộ khối tài chính, chuẩn bị cho CFA Level I. Bao gồm câu hỏi tính toán, case study và phân tích.",
    instructions: [
      "Thời gian: 90 phút, 30 câu hỏi.",
      "Được sử dụng máy tính trong suốt bài thi.",
      "Không được phép quay lại câu trước trong phần Case Study.",
      "Bật webcam bắt buộc. Phát hiện gian lận sẽ hủy bài thi.",
    ],
    sections: [
      { id: "S1", title: "Phần I: Kiến thức Cơ bản", questions: ["EQ012", "EQ016", "EQ019", "EQ004", "EQ018"] },
      { id: "S2", title: "Phần II: Phân tích & Tính toán", questions: ["EQ005", "EQ006", "EQ014", "EQ007", "EQ013"] },
      { id: "S3", title: "Phần III: Case Study Tài chính", questions: ["EQ008", "EQ011"] },
    ],
    totalQuestions: 12, totalPoints: 42, duration: 90, passingScore: 75,
    maxAttempts: 2, attemptsUsed: 1, bestScore: 82, status: "passed",
    dueDate: "2026-04-15", category: "Tài chính & Kế toán",
    createdBy: "PGS.TS. Lê Hoàng Anh", createdByAvatar: "LA",
    shuffleQuestions: false, shuffleOptions: true, showResults: true, showExplanation: true,
    allowReview: true, allowBacktrack: false, allowCalculator: true, allowNotepad: true,
    proctoringEnabled: true, webcamRequired: true, antiCheat: true,
    difficulty: "expert", tags: ["finance", "certification", "cfa"],
    estimatedTime: 85, avgCompletionTime: 78, avgScore: 65, passRate: 52, totalAttempts: 89,
  },
  {
    id: "EX004",
    title: "Đánh giá Kỹ năng Số (Digital Competency)",
    subtitle: "Assessment chuyển đổi số cho toàn Tập đoàn",
    courseId: "C004", courseName: "Chuyển đổi số trong Doanh nghiệp",
    type: "midterm",
    description: "Bài đánh giá năng lực số bắt buộc cho tất cả cấp quản lý, phục vụ chiến lược chuyển đổi số 2025-2030.",
    instructions: [
      "Thời gian: 30 phút. Không giới hạn lần thi.",
      "Bài kiểm tra bao gồm 15 câu hỏi đa dạng.",
    ],
    sections: [
      { id: "S1", title: "Năng lực Số", questions: ["EQ010", "EQ015", "EQ003", "EQ017", "EQ020", "EQ001", "EQ009", "EQ012"] },
    ],
    totalQuestions: 8, totalPoints: 12, duration: 30, passingScore: 60,
    maxAttempts: 99, attemptsUsed: 0, bestScore: null, status: "not_started",
    dueDate: "2026-04-01", category: "Chuyển đổi số",
    createdBy: "ThS. Phạm Đức Thắng", createdByAvatar: "PĐ",
    shuffleQuestions: true, shuffleOptions: true, showResults: true, showExplanation: true,
    allowReview: true, allowBacktrack: true, allowCalculator: false, allowNotepad: true,
    proctoringEnabled: false, webcamRequired: false, antiCheat: false,
    difficulty: "medium", tags: ["digital", "assessment"],
    estimatedTime: 25, avgCompletionTime: 22, avgScore: 74, passRate: 78, totalAttempts: 520,
  },
  {
    id: "EX005",
    title: "Khảo sát Trải nghiệm Đào tạo Q1/2026",
    subtitle: "Feedback & đánh giá chất lượng khóa học",
    courseId: "C005", courseName: "Khảo sát nội bộ",
    type: "survey",
    description: "Khảo sát ý kiến học viên về chất lượng đào tạo, giảng viên và hệ thống LMS.",
    instructions: ["Không có đáp án đúng/sai. Hãy trả lời trung thực.", "Thời gian: 10 phút."],
    sections: [
      { id: "S1", title: "Đánh giá", questions: ["EQ007"] },
    ],
    totalQuestions: 1, totalPoints: 5, duration: 10, passingScore: 0,
    maxAttempts: 1, attemptsUsed: 1, bestScore: 100, status: "submitted",
    dueDate: "2026-03-31", category: "Khảo sát",
    createdBy: "Ban Đào tạo", createdByAvatar: "BĐ",
    shuffleQuestions: false, shuffleOptions: false, showResults: false, showExplanation: false,
    allowReview: false, allowBacktrack: true, allowCalculator: false, allowNotepad: false,
    proctoringEnabled: false, webcamRequired: false, antiCheat: false,
    difficulty: "easy", tags: ["survey", "feedback"],
    estimatedTime: 8, avgCompletionTime: 7, avgScore: 100, passRate: 100, totalAttempts: 2100,
  },
  {
    id: "EX006",
    title: "Luyện tập: Quản lý Dự án PMI",
    subtitle: "Practice Exam — PMP Preparation",
    courseId: "C006", courseName: "Quản lý Dự án theo chuẩn PMI",
    type: "practice",
    description: "Bộ đề luyện tập mô phỏng thi PMP thực tế. Không giới hạn lần làm, xem giải thích ngay sau mỗi câu.",
    instructions: ["Chế độ luyện tập: xem đáp án ngay sau mỗi câu.", "Không giới hạn thời gian và số lần."],
    sections: [
      { id: "S1", title: "PMP Practice", questions: ["EQ006", "EQ014", "EQ018", "EQ004", "EQ016"] },
    ],
    totalQuestions: 5, totalPoints: 13, duration: 0, passingScore: 60,
    maxAttempts: 99, attemptsUsed: 5, bestScore: 88, status: "passed",
    dueDate: "2026-12-31", category: "Quản lý Dự án",
    createdBy: "PMP. Vũ Thị Mai", createdByAvatar: "VM",
    shuffleQuestions: true, shuffleOptions: true, showResults: true, showExplanation: true,
    allowReview: true, allowBacktrack: true, allowCalculator: true, allowNotepad: true,
    proctoringEnabled: false, webcamRequired: false, antiCheat: false,
    difficulty: "medium", tags: ["pmp", "practice"],
    estimatedTime: 20, avgCompletionTime: 18, avgScore: 71, passRate: 65, totalAttempts: 450,
  },
];

// ─── Mock attempt history ───
export const MOCK_ATTEMPTS: ExamAttempt[] = [
  {
    id: "ATT001", examId: "EX003", startedAt: "2026-03-08T09:00:00", completedAt: "2026-03-08T10:18:00",
    score: 34, totalPoints: 42, percentage: 82, passed: true, timeSpent: 4680,
    answers: {}, flaggedQuestions: ["EQ016"], confidenceLevels: { EQ012: 3, EQ016: 1 }, tabSwitches: 0,
    questionTimes: { EQ012: 45, EQ016: 180, EQ019: 55, EQ004: 90, EQ018: 75, EQ005: 150, EQ006: 120, EQ014: 80, EQ007: 200, EQ013: 95, EQ008: 350, EQ011: 240 },
  },
  {
    id: "ATT002", examId: "EX002", startedAt: "2026-03-05T14:00:00", completedAt: "2026-03-05T14:12:00",
    score: 13, totalPoints: 18, percentage: 75, passed: false, timeSpent: 720,
    answers: {}, flaggedQuestions: [], confidenceLevels: {}, tabSwitches: 1,
    questionTimes: { EQ009: 30, EQ003: 20, EQ015: 25, EQ020: 35, EQ001: 60, EQ010: 80, EQ017: 45, EQ012: 70, EQ019: 55, EQ013: 90 },
  },
  {
    id: "ATT003", examId: "EX002", startedAt: "2026-03-06T10:00:00", completedAt: "2026-03-06T10:10:00",
    score: 13, totalPoints: 18, percentage: 75, passed: false, timeSpent: 600,
    answers: {}, flaggedQuestions: [], confidenceLevels: {}, tabSwitches: 0,
    questionTimes: { EQ009: 25, EQ003: 18, EQ015: 20, EQ020: 30, EQ001: 55, EQ010: 70, EQ017: 40, EQ012: 60, EQ019: 45, EQ013: 80 },
  },
];

// Helper
export function getQuestionById(id: string): ExamQuestion | undefined {
  return QUESTION_BANK.find(q => q.id === id);
}
export function getExamQuestions(exam: Exam): ExamQuestion[] {
  const ids = exam.sections.flatMap(s => s.questions);
  return ids.map(id => getQuestionById(id)).filter(Boolean) as ExamQuestion[];
}
