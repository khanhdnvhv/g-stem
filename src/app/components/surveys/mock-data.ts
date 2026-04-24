// ============================================================
// MODULE KHẢO SÁT ĐÀO TẠO — Mock Data & Types (Enhanced)
// Geleximco LMS — Training Survey Management
// ============================================================

export type QuestionType = "rating" | "single" | "multiple" | "text" | "nps" | "matrix";

export type SurveyStatus = "draft" | "active" | "closed" | "scheduled";

export type SurveyCategory = "post_course" | "needs_assessment" | "satisfaction" | "onboarding" | "instructor_eval" | "custom";

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: string[];
  ratingMax?: number;
  ratingLabels?: string[];
  matrixRows?: string[];
  matrixColumns?: string[];
  placeholder?: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  category: SurveyCategory;
  status: SurveyStatus;
  createdBy: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  targetAudience: string;
  courseId?: string;
  courseName?: string;
  questions: SurveyQuestion[];
  responseCount: number;
  targetCount: number;
  isAnonymous: boolean;
  subsidiaryScope: string[];
  tags?: string[];
  priority?: "low" | "medium" | "high";
  reminderSent?: number;
  lastReminderDate?: string;
  avgCompletionMinutes?: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string;
  respondentName: string;
  respondentDept: string;
  respondentSubsidiary: string;
  submittedAt: string;
  answers: Record<string, string | string[] | number>;
}

// ─── Category Config ───

export const CATEGORY_CONFIG: Record<SurveyCategory, {
  label: string;
  color: string;
  bg: string;
  description: string;
}> = {
  post_course: { label: "Sau khóa học", color: "#2563eb", bg: "#2563eb12", description: "Đánh giá sau khi hoàn thành khóa học" },
  needs_assessment: { label: "Nhu cầu đào tạo", color: "#16a34a", bg: "#16a34a12", description: "Khảo sát nhu cầu đào tạo nhân sự" },
  satisfaction: { label: "Mức độ hài lòng", color: "#c8a84e", bg: "#c8a84e15", description: "Đánh giá sự hài lòng tổng thể" },
  onboarding: { label: "Onboarding", color: "#7c3aed", bg: "#7c3aed12", description: "Khảo sát chương trình hội nhập" },
  instructor_eval: { label: "Đánh giá giảng viên", color: "#990803", bg: "#99080312", description: "Đánh giá chất lượng giảng dạy" },
  custom: { label: "Tùy chỉnh", color: "#64748b", bg: "#64748b12", description: "Khảo sát tùy chỉnh" },
};

export const STATUS_CONFIG: Record<SurveyStatus, {
  label: string;
  color: string;
  bg: string;
}> = {
  draft: { label: "Bản nháp", color: "#64748b", bg: "#64748b12" },
  active: { label: "Đang thu thập", color: "#16a34a", bg: "#16a34a12" },
  closed: { label: "Đã đóng", color: "#990803", bg: "#99080312" },
  scheduled: { label: "Đã lên lịch", color: "#7c3aed", bg: "#7c3aed12" },
};

export const QUESTION_TYPE_CONFIG: Record<QuestionType, {
  label: string;
  icon: string;
  description: string;
}> = {
  rating: { label: "Đánh giá sao", icon: "⭐", description: "Thang điểm 1-5 sao" },
  single: { label: "Chọn một", icon: "○", description: "Chọn một đáp án" },
  multiple: { label: "Chọn nhiều", icon: "☐", description: "Chọn nhiều đáp án" },
  text: { label: "Tự luận", icon: "✎", description: "Trả lời văn bản tự do" },
  nps: { label: "NPS", icon: "📊", description: "Net Promoter Score (0-10)" },
  matrix: { label: "Ma trận", icon: "▦", description: "Đánh giá nhiều tiêu chí" },
};

// ─── Mock Surveys ───

export const MOCK_SURVEYS: Survey[] = [
  {
    id: "SV001",
    title: "Đánh giá khóa Kỹ năng Lãnh đạo cho Quản lý Cấp trung",
    description: "Khảo sát đánh giá chất lượng khóa học, nội dung giảng dạy và mức độ áp dụng thực tế",
    category: "post_course",
    status: "active",
    createdBy: "Phòng Đào tạo",
    createdAt: "01/03/2026",
    startDate: "05/03/2026",
    endDate: "20/03/2026",
    targetAudience: "Học viên khóa C001",
    courseId: "C001",
    courseName: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung",
    responseCount: 145,
    targetCount: 210,
    isAnonymous: false,
    subsidiaryScope: ["Tất cả"],
    tags: ["lãnh đạo", "quản lý", "Q1/2026"],
    priority: "high",
    reminderSent: 2,
    lastReminderDate: "10/03/2026",
    avgCompletionMinutes: 8,
    questions: [
      { id: "Q1", type: "rating", text: "Nội dung khóa học phù hợp với công việc thực tế", required: true, ratingMax: 5, ratingLabels: ["Rất không phù hợp", "Không phù hợp", "Bình thường", "Phù hợp", "Rất phù hợp"] },
      { id: "Q2", type: "rating", text: "Chất lượng tài liệu và bài giảng", required: true, ratingMax: 5 },
      { id: "Q3", type: "rating", text: "Phương pháp giảng dạy của giảng viên", required: true, ratingMax: 5 },
      { id: "Q4", type: "single", text: "Bạn sẽ áp dụng kiến thức đã học vào công việc trong bao lâu?", required: true, options: ["Ngay lập tức", "Trong 1 tháng", "Trong 3 tháng", "Chưa xác định"] },
      { id: "Q5", type: "multiple", text: "Module nào bạn thấy hữu ích nhất? (chọn nhiều)", required: false, options: ["Tư duy chiến lược", "Quản lý đội ngũ", "Ra quyết định", "Giao tiếp lãnh đạo", "Quản lý thay đổi", "Coaching & Mentoring"] },
      { id: "Q6", type: "nps", text: "Bạn có giới thiệu khóa học này cho đồng nghiệp không?", required: true },
      { id: "Q7", type: "text", text: "Góp ý và đề xuất cải thiện khóa học", required: false, placeholder: "Nhập ý kiến của bạn..." },
    ],
  },
  {
    id: "SV002",
    title: "Khảo sát Nhu cầu Đào tạo Q2/2026",
    description: "Thu thập nhu cầu đào tạo từ toàn bộ nhân sự để xây dựng kế hoạch đào tạo Q2/2026",
    category: "needs_assessment",
    status: "active",
    createdBy: "Ban Đào tạo Tập đoàn",
    createdAt: "25/02/2026",
    startDate: "01/03/2026",
    endDate: "15/03/2026",
    targetAudience: "Toàn bộ nhân sự Geleximco",
    responseCount: 2340,
    targetCount: 6610,
    isAnonymous: true,
    subsidiaryScope: ["Tất cả"],
    tags: ["nhu cầu", "kế hoạch", "Q2/2026"],
    priority: "high",
    reminderSent: 3,
    lastReminderDate: "12/03/2026",
    avgCompletionMinutes: 12,
    questions: [
      { id: "Q1", type: "matrix", text: "Đánh giá mức độ cần đào tạo cho các kỹ năng sau", required: true,
        matrixRows: ["Kỹ năng lãnh đạo", "Chuyên môn nghiệp vụ", "Kỹ năng số (Digital)", "Ngoại ngữ", "Quản lý dự án", "Kỹ năng giao tiếp"],
        matrixColumns: ["Không cần", "Ít cần", "Cần thiết", "Rất cần", "Cấp bách"] },
      { id: "Q2", type: "single", text: "Hình thức đào tạo bạn ưa thích nhất", required: true, options: ["Trực tuyến (e-learning)", "Trực tiếp tại lớp", "Kết hợp (Blended)", "Tự học có hướng dẫn", "Workshop/Hội thảo"] },
      { id: "Q3", type: "multiple", text: "Lĩnh vực chuyên môn bạn muốn được đào tạo thêm", required: true, options: ["Bất động sản", "Tài chính - Ngân hàng", "Công nghệ thông tin", "Marketing & Truyền thông", "Pháp luật & Tuân thủ", "ESG & Phát triển bền vững", "Quản trị nhân sự", "An toàn lao động"] },
      { id: "Q4", type: "single", text: "Thời gian phù hợp nhất để tham gia đào tạo", required: true, options: ["Sáng (8:00-12:00)", "Chiều (13:30-17:30)", "Tối (18:00-21:00)", "Cuối tuần", "Linh hoạt"] },
      { id: "Q5", type: "text", text: "Khóa học/kỹ năng cụ thể bạn muốn đề xuất", required: false, placeholder: "Nhập đề xuất cụ thể..." },
    ],
  },
  {
    id: "SV003",
    title: "Đánh giá Giảng viên — Trần Thị Minh Ngọc",
    description: "Đánh giá chất lượng giảng dạy của GV Trần Thị Minh Ngọc trong các khóa Marketing",
    category: "instructor_eval",
    status: "closed",
    createdBy: "Phòng Đào tạo",
    createdAt: "01/02/2026",
    startDate: "10/02/2026",
    endDate: "28/02/2026",
    targetAudience: "Học viên các khóa Marketing",
    responseCount: 198,
    targetCount: 220,
    isAnonymous: true,
    subsidiaryScope: ["Tất cả"],
    tags: ["giảng viên", "marketing"],
    priority: "medium",
    avgCompletionMinutes: 6,
    questions: [
      { id: "Q1", type: "rating", text: "Kiến thức chuyên môn của giảng viên", required: true, ratingMax: 5 },
      { id: "Q2", type: "rating", text: "Khả năng truyền đạt và giải thích", required: true, ratingMax: 5 },
      { id: "Q3", type: "rating", text: "Sự nhiệt tình và tương tác với học viên", required: true, ratingMax: 5 },
      { id: "Q4", type: "rating", text: "Sử dụng ví dụ thực tế và case study", required: true, ratingMax: 5 },
      { id: "Q5", type: "rating", text: "Quản lý thời gian lớp học", required: true, ratingMax: 5 },
      { id: "Q6", type: "nps", text: "Bạn có muốn học thêm khóa khác với giảng viên này?", required: true },
      { id: "Q7", type: "text", text: "Nhận xét thêm về giảng viên", required: false },
    ],
  },
  {
    id: "SV004",
    title: "Khảo sát Mức độ Hài lòng LMS Geleximco",
    description: "Đánh giá trải nghiệm người dùng và mức độ hài lòng với hệ thống LMS",
    category: "satisfaction",
    status: "active",
    createdBy: "Ban CNTT",
    createdAt: "10/03/2026",
    startDate: "10/03/2026",
    endDate: "31/03/2026",
    targetAudience: "Toàn bộ người dùng LMS",
    responseCount: 890,
    targetCount: 3090,
    isAnonymous: true,
    subsidiaryScope: ["Tất cả"],
    tags: ["LMS", "hài lòng", "UX"],
    priority: "medium",
    reminderSent: 1,
    avgCompletionMinutes: 10,
    questions: [
      { id: "Q1", type: "rating", text: "Giao diện dễ sử dụng", required: true, ratingMax: 5 },
      { id: "Q2", type: "rating", text: "Tốc độ tải trang", required: true, ratingMax: 5 },
      { id: "Q3", type: "rating", text: "Nội dung khóa học đa dạng", required: true, ratingMax: 5 },
      { id: "Q4", type: "rating", text: "Hệ thống thi và kiểm tra", required: true, ratingMax: 5 },
      { id: "Q5", type: "single", text: "Bạn sử dụng LMS trên thiết bị nào nhiều nhất?", required: true, options: ["Máy tính bàn", "Laptop", "Tablet", "Điện thoại"] },
      { id: "Q6", type: "multiple", text: "Tính năng bạn sử dụng nhiều nhất", required: false, options: ["Học trực tuyến", "Làm bài kiểm tra", "Diễn đàn", "Xem chứng chỉ", "Lộ trình đào tạo", "Xem báo cáo"] },
      { id: "Q7", type: "nps", text: "Bạn có giới thiệu LMS Geleximco cho người khác?", required: true },
      { id: "Q8", type: "text", text: "Tính năng bạn muốn bổ sung", required: false },
    ],
  },
  {
    id: "SV005",
    title: "Đánh giá Chương trình Onboarding Q1/2026",
    description: "Khảo sát nhân viên mới về chương trình hội nhập, giúp cải thiện quy trình onboarding",
    category: "onboarding",
    status: "closed",
    createdBy: "Phòng Nhân sự",
    createdAt: "15/01/2026",
    startDate: "20/01/2026",
    endDate: "28/02/2026",
    targetAudience: "Nhân viên mới Q1/2026",
    responseCount: 118,
    targetCount: 128,
    isAnonymous: false,
    subsidiaryScope: ["Tất cả"],
    tags: ["onboarding", "nhân viên mới"],
    priority: "medium",
    avgCompletionMinutes: 7,
    questions: [
      { id: "Q1", type: "rating", text: "Nội dung chương trình onboarding đầy đủ và hữu ích", required: true, ratingMax: 5 },
      { id: "Q2", type: "rating", text: "Mentor/Buddy hỗ trợ tốt trong giai đoạn đầu", required: true, ratingMax: 5 },
      { id: "Q3", type: "rating", text: "Hiểu rõ văn hóa và giá trị cốt lõi Geleximco", required: true, ratingMax: 5 },
      { id: "Q4", type: "single", text: "Thời gian onboarding phù hợp không?", required: true, options: ["Quá ngắn", "Hơi ngắn", "Vừa đủ", "Hơi dài", "Quá dài"] },
      { id: "Q5", type: "nps", text: "Mức độ sẵn sàng của bạn sau chương trình onboarding", required: true },
      { id: "Q6", type: "text", text: "Điều gì cần cải thiện trong chương trình onboarding?", required: false },
    ],
  },
  {
    id: "SV006",
    title: "Đánh giá khóa An toàn Lao động 2026",
    description: "Khảo sát sau khóa đào tạo An toàn lao động bắt buộc",
    category: "post_course",
    status: "scheduled",
    createdBy: "Phòng An toàn",
    createdAt: "10/03/2026",
    startDate: "25/03/2026",
    endDate: "10/04/2026",
    targetAudience: "Nhân viên khối Kỹ thuật & Xây dựng",
    courseId: "C009",
    courseName: "An toàn Lao động & Phòng cháy chữa cháy",
    responseCount: 0,
    targetCount: 450,
    isAnonymous: false,
    subsidiaryScope: ["Geleximco Land", "Geleximco Construction"],
    tags: ["ATLĐ", "bắt buộc", "Q1/2026"],
    priority: "high",
    avgCompletionMinutes: 5,
    questions: [
      { id: "Q1", type: "rating", text: "Kiến thức về an toàn lao động được cập nhật đầy đủ", required: true, ratingMax: 5 },
      { id: "Q2", type: "rating", text: "Phần thực hành và diễn tập hữu ích", required: true, ratingMax: 5 },
      { id: "Q3", type: "single", text: "Bạn tự tin áp dụng kiến thức ATLĐ vào công việc?", required: true, options: ["Rất tự tin", "Tự tin", "Bình thường", "Chưa tự tin", "Không tự tin"] },
      { id: "Q4", type: "nps", text: "Đánh giá tổng thể khóa đào tạo ATLĐ", required: true },
      { id: "Q5", type: "text", text: "Góp ý cho khóa đào tạo", required: false },
    ],
  },
  {
    id: "SV007",
    title: "Đánh giá Giảng viên — Nguyễn Hoàng Nam",
    description: "Đánh giá chất lượng giảng dạy của GV Nguyễn Hoàng Nam cho các khóa Tài chính",
    category: "instructor_eval",
    status: "active",
    createdBy: "Phòng Đào tạo",
    createdAt: "05/03/2026",
    startDate: "06/03/2026",
    endDate: "20/03/2026",
    targetAudience: "Học viên các khóa Tài chính",
    responseCount: 67,
    targetCount: 95,
    isAnonymous: true,
    subsidiaryScope: ["ABBank", "Geleximco Capital"],
    tags: ["giảng viên", "tài chính"],
    priority: "medium",
    avgCompletionMinutes: 5,
    questions: [
      { id: "Q1", type: "rating", text: "Kiến thức chuyên môn của giảng viên", required: true, ratingMax: 5 },
      { id: "Q2", type: "rating", text: "Khả năng truyền đạt và giải thích", required: true, ratingMax: 5 },
      { id: "Q3", type: "rating", text: "Sự nhiệt tình và tương tác", required: true, ratingMax: 5 },
      { id: "Q4", type: "nps", text: "Bạn có muốn học thêm khóa khác với GV này?", required: true },
      { id: "Q5", type: "text", text: "Nhận xét thêm", required: false },
    ],
  },
  {
    id: "SV008",
    title: "Khảo sát Văn hóa Doanh nghiệp Geleximco 2026",
    description: "Đánh giá mức độ gắn kết và hiểu biết về văn hóa doanh nghiệp tại Tập đoàn",
    category: "custom",
    status: "draft",
    createdBy: "Ban Truyền thông",
    createdAt: "12/03/2026",
    targetAudience: "Toàn bộ nhân sự",
    responseCount: 0,
    targetCount: 6610,
    isAnonymous: true,
    subsidiaryScope: ["Tất cả"],
    tags: ["văn hóa", "gắn kết", "2026"],
    priority: "low",
    avgCompletionMinutes: 15,
    questions: [
      { id: "Q1", type: "rating", text: "Tôi hiểu rõ sứ mệnh và tầm nhìn của Geleximco", required: true, ratingMax: 5 },
      { id: "Q2", type: "rating", text: "Tôi tự hào là thành viên Geleximco", required: true, ratingMax: 5 },
      { id: "Q3", type: "rating", text: "Văn hóa làm việc tại đơn vị tôi tích cực và hỗ trợ", required: true, ratingMax: 5 },
      { id: "Q4", type: "multiple", text: "Giá trị cốt lõi nào của Geleximco bạn cảm nhận rõ nhất?", required: true, options: ["Đổi mới sáng tạo", "Trách nhiệm xã hội", "Phát triển bền vững", "Đoàn kết hợp tác", "Chính trực minh bạch", "Hướng tới khách hàng"] },
      { id: "Q5", type: "text", text: "Bạn đề xuất gì để cải thiện văn hóa doanh nghiệp?", required: false },
    ],
  },
];

// ─── Mock Responses (aggregated data for analytics) ───

export interface AggregatedRating {
  questionId: string;
  questionText: string;
  distribution: number[];
  average: number;
}

export interface AggregatedChoice {
  questionId: string;
  questionText: string;
  options: { label: string; count: number; percentage: number }[];
}

export interface AggregatedNPS {
  questionId: string;
  questionText: string;
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  distribution: number[];
}

export interface AggregatedText {
  questionId: string;
  questionText: string;
  responses: { text: string; respondent: string; date: string; sentiment?: "positive" | "neutral" | "negative" }[];
  wordCloud: { word: string; count: number }[];
}

// SV001 aggregated results
export const SV001_RATINGS: AggregatedRating[] = [
  { questionId: "Q1", questionText: "Nội dung khóa học phù hợp với công việc thực tế", distribution: [2, 5, 18, 62, 58], average: 4.17 },
  { questionId: "Q2", questionText: "Chất lượng tài liệu và bài giảng", distribution: [1, 3, 12, 55, 74], average: 4.37 },
  { questionId: "Q3", questionText: "Phương pháp giảng dạy của giảng viên", distribution: [0, 2, 8, 48, 87], average: 4.52 },
];

export const SV001_CHOICES: AggregatedChoice[] = [
  { questionId: "Q4", questionText: "Bạn sẽ áp dụng kiến thức đã học vào công việc trong bao lâu?",
    options: [
      { label: "Ngay lập tức", count: 42, percentage: 29 },
      { label: "Trong 1 tháng", count: 68, percentage: 47 },
      { label: "Trong 3 tháng", count: 28, percentage: 19 },
      { label: "Chưa xác định", count: 7, percentage: 5 },
    ]},
  { questionId: "Q5", questionText: "Module nào bạn thấy hữu ích nhất?",
    options: [
      { label: "Tư duy chiến lược", count: 89, percentage: 61 },
      { label: "Quản lý đội ngũ", count: 102, percentage: 70 },
      { label: "Ra quyết định", count: 78, percentage: 54 },
      { label: "Giao tiếp lãnh đạo", count: 95, percentage: 66 },
      { label: "Quản lý thay đổi", count: 56, percentage: 39 },
      { label: "Coaching & Mentoring", count: 84, percentage: 58 },
    ]},
];

export const SV001_NPS: AggregatedNPS = {
  questionId: "Q6",
  questionText: "Bạn có giới thiệu khóa học này cho đồng nghiệp không?",
  score: 52,
  promoters: 82,
  passives: 41,
  detractors: 22,
  distribution: [2, 1, 3, 5, 6, 5, 12, 18, 23, 38, 32],
};

export const SV001_TEXT: AggregatedText = {
  questionId: "Q7",
  questionText: "Góp ý và đề xuất cải thiện khóa học",
  responses: [
    { text: "Nên bổ sung thêm case study thực tế từ các dự án của Geleximco", respondent: "Nguyễn Văn Hùng", date: "08/03/2026", sentiment: "positive" },
    { text: "Phần thực hành nhóm rất hay, cần tăng thêm thời lượng", respondent: "Trần Thị Lan", date: "07/03/2026", sentiment: "positive" },
    { text: "Giảng viên truyền cảm hứng, mong có thêm các khóa nâng cao", respondent: "Lê Minh Đức", date: "07/03/2026", sentiment: "positive" },
    { text: "Tài liệu tham khảo cần cập nhật thêm sách mới hơn", respondent: "Phạm Thùy Linh", date: "06/03/2026", sentiment: "neutral" },
    { text: "Nên có buổi follow-up sau 1 tháng để đánh giá áp dụng thực tế", respondent: "Hoàng Đức Thịnh", date: "06/03/2026", sentiment: "positive" },
    { text: "Khóa học rất tốt nhưng hơi ngắn, nên kéo dài thêm 1 ngày", respondent: "Vũ Thị Ngọc", date: "05/03/2026", sentiment: "neutral" },
    { text: "Phần coaching 1-on-1 rất giá trị, mong được duy trì", respondent: "Đặng Quốc Anh", date: "05/03/2026", sentiment: "positive" },
    { text: "Phòng học hơi chật cho số lượng 40 người, khó thảo luận nhóm", respondent: "Lý Hoàng Dũng", date: "05/03/2026", sentiment: "negative" },
  ],
  wordCloud: [
    { word: "thực tế", count: 42 }, { word: "case study", count: 38 }, { word: "giảng viên", count: 35 },
    { word: "thực hành", count: 33 }, { word: "nâng cao", count: 28 }, { word: "tài liệu", count: 25 },
    { word: "follow-up", count: 22 }, { word: "nhóm", count: 20 }, { word: "coaching", count: 18 },
    { word: "Geleximco", count: 16 }, { word: "truyền cảm hứng", count: 15 }, { word: "thời lượng", count: 14 },
    { word: "áp dụng", count: 13 }, { word: "cải thiện", count: 12 }, { word: "dự án", count: 11 },
  ],
};

// ─── Response Trend Data (for charts) ───

export interface ResponseTrendPoint {
  date: string;
  count: number;
}

export const SV001_TREND: ResponseTrendPoint[] = [
  { date: "05/03", count: 12 }, { date: "06/03", count: 28 }, { date: "07/03", count: 45 },
  { date: "08/03", count: 18 }, { date: "09/03", count: 8 }, { date: "10/03", count: 22 },
  { date: "11/03", count: 6 }, { date: "12/03", count: 4 }, { date: "13/03", count: 2 },
];

// ─── Subsidiary Breakdown ───

export interface SubsidiaryBreakdown {
  subsidiary: string;
  responseCount: number;
  targetCount: number;
  avgRating: number;
  npsScore: number;
}

export const SV001_SUBSIDIARY_BREAKDOWN: SubsidiaryBreakdown[] = [
  { subsidiary: "VP Tập đoàn", responseCount: 32, targetCount: 40, avgRating: 4.5, npsScore: 62 },
  { subsidiary: "ABBank", responseCount: 28, targetCount: 35, avgRating: 4.3, npsScore: 48 },
  { subsidiary: "Geleximco Land", responseCount: 22, targetCount: 30, avgRating: 4.1, npsScore: 45 },
  { subsidiary: "Xi măng Thăng Long", responseCount: 18, targetCount: 25, avgRating: 4.4, npsScore: 55 },
  { subsidiary: "Hải Phòng Thermal", responseCount: 15, targetCount: 22, avgRating: 3.9, npsScore: 38 },
  { subsidiary: "Geleximco Capital", responseCount: 12, targetCount: 18, avgRating: 4.6, npsScore: 65 },
  { subsidiary: "Geleximco Mining", responseCount: 10, targetCount: 20, avgRating: 4.0, npsScore: 42 },
  { subsidiary: "Khác", responseCount: 8, targetCount: 20, avgRating: 4.2, npsScore: 50 },
];

// ─── AI Insights (mock) ───

export interface AIInsight {
  id: string;
  type: "positive" | "warning" | "suggestion" | "trend";
  title: string;
  description: string;
  confidence: number;
  relatedQuestions?: string[];
}

export const SV001_AI_INSIGHTS: AIInsight[] = [
  { id: "AI1", type: "positive", title: "Giảng viên được đánh giá rất cao", description: "Phương pháp giảng dạy nhận điểm TB 4.52/5 — cao nhất trong tất cả tiêu chí. 60% học viên cho 5 sao.", confidence: 95, relatedQuestions: ["Q3"] },
  { id: "AI2", type: "suggestion", title: "Bổ sung case study thực tế Geleximco", description: "42 phản hồi tự luận đề cập \"thực tế\" và \"case study\" — nhu cầu rõ ràng về ví dụ từ nội bộ Tập đoàn.", confidence: 88, relatedQuestions: ["Q7"] },
  { id: "AI3", type: "warning", title: "Tỷ lệ phản hồi cần cải thiện", description: "Chỉ 69% mục tiêu đã phản hồi. Hải Phòng Thermal và Geleximco Mining có tỷ lệ thấp nhất (<60%).", confidence: 92 },
  { id: "AI4", type: "trend", title: "NPS tăng 12 điểm so với Q4/2025", description: "NPS +52 hiện tại so với +40 của khảo sát tương tự Q4/2025. Xu hướng tích cực và ổn định.", confidence: 85 },
  { id: "AI5", type: "suggestion", title: "Thêm buổi follow-up sau 1 tháng", description: "22 phản hồi đề xuất theo dõi sau đào tạo. Đây là best practice trong L&D hiện đại.", confidence: 82, relatedQuestions: ["Q7"] },
];

// ─── Learner Survey History ───

export interface LearnerSurveyHistory {
  surveyId: string;
  surveyTitle: string;
  category: SurveyCategory;
  completedAt: string;
  timeSpentMinutes: number;
  pointsEarned: number;
}

export const LEARNER_SURVEY_HISTORY: LearnerSurveyHistory[] = [
  { surveyId: "SV003", surveyTitle: "Đánh giá Giảng viên — Trần Thị Minh Ngọc", category: "instructor_eval", completedAt: "25/02/2026", timeSpentMinutes: 5, pointsEarned: 15 },
  { surveyId: "SV005", surveyTitle: "Đánh giá Chương trình Onboarding Q1/2026", category: "onboarding", completedAt: "18/02/2026", timeSpentMinutes: 8, pointsEarned: 20 },
];

// ─── Survey templates ───

export interface SurveyTemplate {
  id: string;
  name: string;
  category: SurveyCategory;
  description: string;
  questionCount: number;
  usageCount?: number;
}

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  { id: "TPL01", name: "Đánh giá sau khóa học (Chuẩn)", category: "post_course", description: "Mẫu khảo sát tiêu chuẩn sau mỗi khóa đào tạo", questionCount: 7, usageCount: 24 },
  { id: "TPL02", name: "Khảo sát nhu cầu đào tạo", category: "needs_assessment", description: "Thu thập nhu cầu đào tạo theo kỹ năng, lĩnh vực", questionCount: 5, usageCount: 8 },
  { id: "TPL03", name: "Đánh giá giảng viên", category: "instructor_eval", description: "Đánh giá toàn diện chất lượng giảng dạy", questionCount: 7, usageCount: 32 },
  { id: "TPL04", name: "Mức độ hài lòng hệ thống", category: "satisfaction", description: "Khảo sát trải nghiệm người dùng LMS", questionCount: 8, usageCount: 4 },
  { id: "TPL05", name: "Đánh giá onboarding", category: "onboarding", description: "Khảo sát nhân viên mới về chương trình hội nhập", questionCount: 6, usageCount: 12 },
  { id: "TPL06", name: "Khảo sát trống (Tùy chỉnh)", category: "custom", description: "Tạo khảo sát từ đầu với câu hỏi tùy chỉnh", questionCount: 0, usageCount: 6 },
];

// ─── Helper functions ───

export function getSurveyCompletionRate(survey: Survey): number {
  return survey.targetCount > 0 ? Math.round((survey.responseCount / survey.targetCount) * 100) : 0;
}

export function getActiveSurveyCount(): number {
  return MOCK_SURVEYS.filter(s => s.status === "active").length;
}

export function getPendingSurveys(): Survey[] {
  return MOCK_SURVEYS.filter(s => s.status === "active");
}

export function getDaysRemaining(endDate?: string): number {
  if (!endDate) return -1;
  const parts = endDate.split("/");
  const end = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  const now = new Date(2026, 2, 13);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}
