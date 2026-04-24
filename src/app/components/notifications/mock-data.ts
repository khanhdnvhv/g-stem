// ============================================================
// NOTIFICATION CENTER — Mock Data & Types
// Geleximco LMS — Trung tâm Thông báo
// ============================================================

export type NotificationCategory =
  | "grading"
  | "exam"
  | "course"
  | "certificate"
  | "workflow"
  | "mentoring"
  | "forum"
  | "system"
  | "hr"
  | "achievement";

export type NotificationPriority = "urgent" | "high" | "normal" | "low";

export interface Notification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;       // e.g. "2 phút trước"
  timestampISO: string;    // for sorting
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  sender?: string;
  senderAvatar?: string;
  metadata?: Record<string, string>;
}

export interface NotificationPreference {
  category: NotificationCategory;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

// ─── Category Config ───

export const CATEGORY_CONFIG: Record<NotificationCategory, {
  label: string;
  color: string;
  bg: string;
  icon: string; // lucide icon name reference
}> = {
  grading: { label: "Chấm điểm", color: "#990803", bg: "#99080312" },
  exam: { label: "Thi & Kiểm tra", color: "#7c3aed", bg: "#7c3aed12" },
  course: { label: "Khóa học", color: "#2563eb", bg: "#2563eb12" },
  certificate: { label: "Chứng chỉ", color: "#c8a84e", bg: "#c8a84e15" },
  workflow: { label: "Phê duyệt", color: "#ea580c", bg: "#ea580c12" },
  mentoring: { label: "Mentoring", color: "#ec4899", bg: "#ec489912" },
  forum: { label: "Diễn đàn", color: "#0891b2", bg: "#0891b212" },
  system: { label: "Hệ thống", color: "#64748b", bg: "#64748b12" },
  hr: { label: "Nhân sự", color: "#16a34a", bg: "#16a34a12" },
  achievement: { label: "Thành tích", color: "#d97706", bg: "#d9770612" },
};

export const PRIORITY_CONFIG: Record<NotificationPriority, {
  label: string;
  color: string;
  bg: string;
}> = {
  urgent: { label: "Khẩn cấp", color: "#dc2626", bg: "#dc262612" },
  high: { label: "Quan trọng", color: "#ea580c", bg: "#ea580c12" },
  normal: { label: "Bình thường", color: "#2563eb", bg: "#2563eb12" },
  low: { label: "Thấp", color: "#64748b", bg: "#64748b12" },
};

// ─── Mock Notifications (30 items, Vietnamese diacritics) ───

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "N001",
    category: "grading",
    priority: "urgent",
    title: "5 bài nộp quá hạn chấm điểm",
    message: "Bạn có 5 bài tự luận từ khóa \"Phân tích Tài chính\" đã quá hạn chấm 48 giờ. Vui lòng chấm điểm ngay.",
    timestamp: "5 phút trước",
    timestampISO: "2026-03-12T08:55:00",
    isRead: false,
    actionUrl: "/grading",
    actionLabel: "Chấm ngay",
    sender: "Hệ thống Chấm điểm",
  },
  {
    id: "N002",
    category: "exam",
    priority: "high",
    title: "Lịch thi mới: Quản lý Rủi ro Tài chính",
    message: "Kỳ thi \"Quản lý Rủi ro Tài chính\" được lên lịch vào 15/03/2026, 09:00-11:00. 245 thí sinh đăng ký.",
    timestamp: "15 phút trước",
    timestampISO: "2026-03-12T08:45:00",
    isRead: false,
    actionUrl: "/quizzes?tab=scheduling",
    actionLabel: "Xem lịch thi",
    sender: "Ban Đào tạo",
  },
  {
    id: "N003",
    category: "course",
    priority: "normal",
    title: "Khóa học mới chờ phê duyệt",
    message: "GV Trần Thị Minh Ngọc đã gửi khóa \"ESG & Phát triển Bền vững trong BĐS\" để duyệt nội dung.",
    timestamp: "30 phút trước",
    timestampISO: "2026-03-12T08:30:00",
    isRead: false,
    actionUrl: "/courses",
    actionLabel: "Xem & Duyệt",
    sender: "Trần Thị Minh Ngọc",
    senderAvatar: "MN",
  },
  {
    id: "N004",
    category: "certificate",
    priority: "urgent",
    title: "23 chứng chỉ An toàn LĐ sắp hết hạn",
    message: "Chứng chỉ An toàn Lao động của 23 nhân viên Geleximco Land sẽ hết hạn trong 7 ngày. Cần gia hạn ngay.",
    timestamp: "1 giờ trước",
    timestampISO: "2026-03-12T08:00:00",
    isRead: false,
    actionUrl: "/certificates",
    actionLabel: "Xem danh sách",
    sender: "Hệ thống Chứng chỉ",
  },
  {
    id: "N005",
    category: "workflow",
    priority: "high",
    title: "Yêu cầu phê duyệt đăng ký khóa học",
    message: "Phòng Kinh doanh - ABBank gửi yêu cầu đăng ký 15 nhân viên vào khóa \"Kỹ năng Lãnh đạo\". Cần phê duyệt.",
    timestamp: "1 giờ trước",
    timestampISO: "2026-03-12T07:55:00",
    isRead: false,
    actionUrl: "/approvals",
    actionLabel: "Phê duyệt",
    sender: "Nguyễn Văn Hùng",
    senderAvatar: "VH",
  },
  {
    id: "N006",
    category: "grading",
    priority: "normal",
    title: "Học viên khiếu nại điểm bài thi",
    message: "Lê Hoàng Nam (ABBank) khiếu nại điểm bài \"Phân tích dòng tiền FCF\" — 58/100, yêu cầu xem xét lại.",
    timestamp: "2 giờ trước",
    timestampISO: "2026-03-12T07:00:00",
    isRead: false,
    actionUrl: "/grading",
    actionLabel: "Xem khiếu nại",
    sender: "Lê Hoàng Nam",
    senderAvatar: "LN",
  },
  {
    id: "N007",
    category: "mentoring",
    priority: "normal",
    title: "Phiên mentoring mới được đặt lịch",
    message: "Phạm Thùy Linh đặt lịch mentoring với bạn vào 13/03/2026 lúc 14:00. Chủ đề: Career Development.",
    timestamp: "2 giờ trước",
    timestampISO: "2026-03-12T06:55:00",
    isRead: false,
    actionUrl: "/mentoring",
    actionLabel: "Xem lịch",
    sender: "Phạm Thùy Linh",
    senderAvatar: "TL",
  },
  {
    id: "N008",
    category: "forum",
    priority: "low",
    title: "3 câu hỏi mới trên diễn đàn khóa học",
    message: "Diễn đàn \"Marketing số & Truyền thông\" có 3 câu hỏi mới chưa được trả lời trong 24h qua.",
    timestamp: "3 giờ trước",
    timestampISO: "2026-03-12T06:00:00",
    isRead: true,
    actionUrl: "/forum",
    actionLabel: "Trả lời",
  },
  {
    id: "N009",
    category: "system",
    priority: "normal",
    title: "Bảo trì hệ thống định kỳ",
    message: "Hệ thống LMS sẽ bảo trì từ 23:00 ngày 14/03 đến 02:00 ngày 15/03/2026. Vui lòng lưu công việc trước.",
    timestamp: "3 giờ trước",
    timestampISO: "2026-03-12T05:55:00",
    isRead: true,
    sender: "Admin Hệ thống",
  },
  {
    id: "N010",
    category: "hr",
    priority: "normal",
    title: "Đồng bộ nhân sự hoàn tất",
    message: "Đợt đồng bộ nhân sự Q1/2026 đã hoàn tất: 128 nhân viên mới, 15 điều chuyển, 8 nghỉ việc.",
    timestamp: "4 giờ trước",
    timestampISO: "2026-03-12T05:00:00",
    isRead: true,
    actionUrl: "/employees",
    actionLabel: "Xem chi tiết",
    sender: "Hệ thống HR",
  },
  {
    id: "N011",
    category: "achievement",
    priority: "low",
    title: "Nguyễn Thị Hà đạt huy hiệu \"Top Learner\"",
    message: "Nguyễn Thị Hà (Phòng Marketing - Geleximco Land) đã hoàn thành 15 khóa học, đạt huy hiệu Top Learner Q1.",
    timestamp: "5 giờ trước",
    timestampISO: "2026-03-12T04:00:00",
    isRead: true,
    actionUrl: "/achievements",
    actionLabel: "Xem thành tích",
    sender: "Nguyễn Thị Hà",
    senderAvatar: "TH",
  },
  {
    id: "N012",
    category: "course",
    priority: "normal",
    title: "Hoàn tất tải lên nội dung khóa học",
    message: "18 video bài giảng khóa \"Quản lý Dự án PMI\" đã được xử lý và sẵn sàng xuất bản.",
    timestamp: "6 giờ trước",
    timestampISO: "2026-03-12T03:00:00",
    isRead: true,
    actionUrl: "/content-bank",
    actionLabel: "Xem nội dung",
    sender: "Hệ thống Content",
  },
  {
    id: "N013",
    category: "grading",
    priority: "normal",
    title: "AI đã chấm xong 12 bài tự luận",
    message: "AI Auto-Grading hoàn tất chấm 12 bài tự luận khóa \"Kỹ năng Lãnh đạo\". Độ tin cậy TB: 87%. Cần xác nhận.",
    timestamp: "6 giờ trước",
    timestampISO: "2026-03-12T02:50:00",
    isRead: true,
    actionUrl: "/grading",
    actionLabel: "Xác nhận điểm",
    sender: "AI Grading Engine",
  },
  {
    id: "N014",
    category: "exam",
    priority: "high",
    title: "Phát hiện gian lận trong phòng thi",
    message: "Proctoring AI phát hiện 2 thí sinh nghi vấn gian lận trong kỳ thi \"Tuân thủ Pháp luật\" lúc 14:30 hôm nay.",
    timestamp: "Hôm qua",
    timestampISO: "2026-03-11T14:30:00",
    isRead: true,
    actionUrl: "/quizzes?tab=proctoring",
    actionLabel: "Xem chi tiết",
    sender: "Proctoring AI",
  },
  {
    id: "N015",
    category: "workflow",
    priority: "normal",
    title: "Yêu cầu tạo lộ trình đào tạo mới",
    message: "Khối Kỹ thuật - Geleximco Land yêu cầu tạo lộ trình đào tạo \"Kỹ sư BIM Nâng cao\" cho 35 nhân viên.",
    timestamp: "Hôm qua",
    timestampISO: "2026-03-11T10:00:00",
    isRead: true,
    actionUrl: "/learning-paths",
    actionLabel: "Xem yêu cầu",
    sender: "Trần Đức Mạnh",
    senderAvatar: "ĐM",
  },
  {
    id: "N016",
    category: "certificate",
    priority: "normal",
    title: "45 chứng chỉ mới được cấp",
    message: "Đã cấp 45 chứng chỉ hoàn thành cho khóa \"An toàn Lao động\" đợt T2/2026. Chứng chỉ đã gửi email.",
    timestamp: "Hôm qua",
    timestampISO: "2026-03-11T09:00:00",
    isRead: true,
    actionUrl: "/certificates",
    actionLabel: "Xem chứng chỉ",
  },
  {
    id: "N017",
    category: "course",
    priority: "low",
    title: "Đánh giá khóa học mới nhận",
    message: "Khóa \"Marketing số\" nhận thêm 8 đánh giá mới. Điểm trung bình: 4.6/5.0 ⭐",
    timestamp: "Hôm qua",
    timestampISO: "2026-03-11T08:00:00",
    isRead: true,
    actionUrl: "/reviews",
    actionLabel: "Xem đánh giá",
  },
  {
    id: "N018",
    category: "system",
    priority: "low",
    title: "Báo cáo tháng 2/2026 đã sẵn sàng",
    message: "Báo cáo đào tạo tổng hợp T2/2026 đã được tạo tự động. Bao gồm dữ liệu từ 14 công ty thành viên.",
    timestamp: "2 ngày trước",
    timestampISO: "2026-03-10T07:00:00",
    isRead: true,
    actionUrl: "/reports",
    actionLabel: "Tải báo cáo",
  },
  {
    id: "N019",
    category: "hr",
    priority: "normal",
    title: "15 nhân viên điều chuyển cần cập nhật lộ trình",
    message: "15 nhân viên vừa điều chuyển giữa các công ty thành viên. Cần cập nhật lộ trình đào tạo phù hợp.",
    timestamp: "2 ngày trước",
    timestampISO: "2026-03-10T06:00:00",
    isRead: true,
    actionUrl: "/employees",
    actionLabel: "Cập nhật",
    sender: "Hệ thống HR Sync",
  },
  {
    id: "N020",
    category: "grading",
    priority: "normal",
    title: "Điểm bài tập đã được công bố",
    message: "Điểm bài tập \"Phân tích SWOT Tập đoàn\" khóa Quản lý Chiến lược đã công bố cho 180 học viên.",
    timestamp: "2 ngày trước",
    timestampISO: "2026-03-10T05:00:00",
    isRead: true,
    actionUrl: "/grading",
    actionLabel: "Xem sổ điểm",
  },
  {
    id: "N021",
    category: "mentoring",
    priority: "low",
    title: "Nhắc nhở phiên mentoring tuần này",
    message: "Bạn có 3 phiên mentoring trong tuần này. Phiên gần nhất: 13/03 lúc 10:00 với Nguyễn Minh Tuấn.",
    timestamp: "3 ngày trước",
    timestampISO: "2026-03-09T08:00:00",
    isRead: true,
    actionUrl: "/mentoring",
    actionLabel: "Xem lịch",
  },
  {
    id: "N022",
    category: "exam",
    priority: "normal",
    title: "Kết quả thi đã có — 92% đạt yêu cầu",
    message: "Kỳ thi \"Nghiệp vụ Ngân hàng cơ bản\" ABBank: 230/250 thí sinh đạt (92%). Điểm TB: 76.4.",
    timestamp: "3 ngày trước",
    timestampISO: "2026-03-09T07:00:00",
    isRead: true,
    actionUrl: "/quizzes",
    actionLabel: "Xem thống kê",
  },
  {
    id: "N023",
    category: "achievement",
    priority: "low",
    title: "Phòng Kinh doanh ABBank đạt 100% hoàn thành",
    message: "Toàn bộ 45 nhân viên Phòng KD ABBank đã hoàn thành khóa bắt buộc Q1/2026 trước hạn 2 tuần!",
    timestamp: "4 ngày trước",
    timestampISO: "2026-03-08T10:00:00",
    isRead: true,
    actionUrl: "/subsidiaries",
    actionLabel: "Xem chi tiết",
  },
  {
    id: "N024",
    category: "workflow",
    priority: "normal",
    title: "Ngân sách đào tạo Q2 chờ duyệt",
    message: "Kế hoạch ngân sách đào tạo Q2/2026 trị giá 1.2 tỷ VNĐ đã được Ban Đào tạo gửi lên. Cần phê duyệt.",
    timestamp: "5 ngày trước",
    timestampISO: "2026-03-07T09:00:00",
    isRead: true,
    actionUrl: "/approvals",
    actionLabel: "Xem chi tiết",
    sender: "Ban Đào tạo",
  },
  {
    id: "N025",
    category: "course",
    priority: "normal",
    title: "Khóa học \"Digital Marketing\" đạt 500 đăng ký",
    message: "Khóa \"Digital Marketing cho BĐS\" vượt mốc 500 học viên đăng ký. Tỷ lệ hoàn thành: 68%.",
    timestamp: "5 ngày trước",
    timestampISO: "2026-03-07T08:00:00",
    isRead: true,
    actionUrl: "/courses",
    actionLabel: "Xem khóa học",
  },
  {
    id: "N026",
    category: "forum",
    priority: "low",
    title: "Bài viết nổi bật trên diễn đàn",
    message: "Bài \"Kinh nghiệm áp dụng OKR tại Geleximco\" của Trần Minh Đức nhận 48 lượt thích và 12 bình luận.",
    timestamp: "1 tuần trước",
    timestampISO: "2026-03-05T10:00:00",
    isRead: true,
    actionUrl: "/forum",
    actionLabel: "Đọc bài viết",
    sender: "Trần Minh Đức",
    senderAvatar: "MĐ",
  },
  {
    id: "N027",
    category: "system",
    priority: "normal",
    title: "Cập nhật phiên bản LMS v3.2",
    message: "LMS Geleximco đã nâng cấp lên v3.2: thêm AI Grading, Proctoring nâng cao, và Certificate Canvas Mode.",
    timestamp: "1 tuần trước",
    timestampISO: "2026-03-05T07:00:00",
    isRead: true,
  },
  {
    id: "N028",
    category: "certificate",
    priority: "low",
    title: "Mẫu phôi chứng chỉ mới được tạo",
    message: "Phôi chứng chỉ \"Geleximco Excellence 2026\" đã được thiết kế và phê duyệt. Sẵn sàng sử dụng.",
    timestamp: "1 tuần trước",
    timestampISO: "2026-03-04T09:00:00",
    isRead: true,
    actionUrl: "/certificates",
    actionLabel: "Xem phôi",
  },
  {
    id: "N029",
    category: "exam",
    priority: "low",
    title: "Ngân hàng câu hỏi được cập nhật",
    message: "GV Phạm Văn Tùng thêm 45 câu hỏi mới vào ngân hàng \"Quản lý Rủi ro\". Tổng: 320 câu.",
    timestamp: "1 tuần trước",
    timestampISO: "2026-03-04T08:00:00",
    isRead: true,
    actionUrl: "/quizzes",
    actionLabel: "Xem ngân hàng",
    sender: "Phạm Văn Tùng",
    senderAvatar: "VT",
  },
  {
    id: "N030",
    category: "hr",
    priority: "low",
    title: "Tổng kết Onboarding T2/2026",
    message: "42 nhân viên mới đã hoàn thành chương trình Onboarding. Tỷ lệ hoàn thành: 100%. Điểm TB: 82.3.",
    timestamp: "2 tuần trước",
    timestampISO: "2026-03-01T08:00:00",
    isRead: true,
    actionUrl: "/employees",
    actionLabel: "Xem báo cáo",
  },
];

// ─── Default Notification Preferences ───

export const DEFAULT_PREFERENCES: NotificationPreference[] = [
  { category: "grading", label: "Chấm điểm", description: "Bài nộp mới, quá hạn chấm, khiếu nại điểm, AI chấm xong", email: true, push: true, inApp: true },
  { category: "exam", label: "Thi & Kiểm tra", description: "Lịch thi mới, kết quả thi, phát hiện gian lận, câu hỏi mới", email: true, push: true, inApp: true },
  { category: "course", label: "Khóa học", description: "Khóa mới chờ duyệt, nội dung sẵn sàng, cập nhật đăng ký", email: true, push: false, inApp: true },
  { category: "certificate", label: "Chứng chỉ", description: "Chứng chỉ sắp hết hạn, cấp mới, phôi mới", email: true, push: true, inApp: true },
  { category: "workflow", label: "Phê duyệt", description: "Yêu cầu phê duyệt, ngân sách, đăng ký khóa học", email: true, push: true, inApp: true },
  { category: "mentoring", label: "Mentoring", description: "Lịch mentoring, phiên mới, nhắc nhở", email: false, push: true, inApp: true },
  { category: "forum", label: "Diễn đàn", description: "Câu hỏi mới, bài viết nổi bật, trả lời bình luận", email: false, push: false, inApp: true },
  { category: "system", label: "Hệ thống", description: "Bảo trì, cập nhật phiên bản, báo cáo tự động", email: true, push: false, inApp: true },
  { category: "hr", label: "Nhân sự", description: "Đồng bộ nhân sự, điều chuyển, onboarding", email: true, push: false, inApp: true },
  { category: "achievement", label: "Thành tích", description: "Huy hiệu mới, mốc hoàn thành, bảng xếp hạng", email: false, push: true, inApp: true },
];

// ─── Helper functions ───

export function getUnreadCount(): number {
  return MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
}

export function getUnreadByCategory(): Record<NotificationCategory, number> {
  const result: Record<string, number> = {};
  MOCK_NOTIFICATIONS.filter(n => !n.isRead).forEach(n => {
    result[n.category] = (result[n.category] || 0) + 1;
  });
  return result as Record<NotificationCategory, number>;
}

export function getCategoryList(): NotificationCategory[] {
  return ["grading", "exam", "course", "certificate", "workflow", "mentoring", "forum", "system", "hr", "achievement"];
}
