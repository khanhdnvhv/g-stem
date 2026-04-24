// ============================================================
// KẾ HOẠCH PHÁT TRIỂN CÁ NHÂN (IDP) — Mock Data & Types
// Geleximco LMS — Individual Development Plan
// ============================================================

export type CompetencyLevel = 1 | 2 | 3 | 4 | 5;

export interface Competency {
  id: string;
  name: string;
  category: "core" | "leadership" | "technical" | "soft_skill";
  currentLevel: CompetencyLevel;
  targetLevel: CompetencyLevel;
  weight: number; // percentage weight in overall assessment
}

export type GoalStatus = "not_started" | "in_progress" | "completed" | "overdue" | "cancelled";
export type GoalPriority = "critical" | "high" | "medium" | "low";

export interface DevelopmentGoal {
  id: string;
  title: string;
  description: string;
  competencyIds: string[];    // linked competencies
  status: GoalStatus;
  priority: GoalPriority;
  startDate: string;
  targetDate: string;
  progress: number;           // 0-100
  activities: DevelopmentActivity[];
  managerNotes?: string;
}

export type ActivityType = "course" | "mentoring" | "project" | "certification" | "workshop" | "self_study" | "coaching" | "rotation";

export interface DevelopmentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  status: GoalStatus;
  dueDate: string;
  completedDate?: string;
  linkedCourseId?: string;
  linkedMentorId?: string;
  hours: number;
}

export type IDPStatus = "draft" | "pending_approval" | "approved" | "in_progress" | "review" | "completed";
export type IDPCycle = "Q1/2026" | "Q2/2026" | "Q3/2026" | "Q4/2026" | "Annual 2026";

export interface IndividualDevelopmentPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  employeeDept: string;
  employeeSubsidiary: string;
  employeeAvatar: string;       // initials
  managerId: string;
  managerName: string;
  mentorId?: string;
  mentorName?: string;
  cycle: IDPCycle;
  status: IDPStatus;
  createdAt: string;
  updatedAt: string;
  overallProgress: number;
  competencies: Competency[];
  goals: DevelopmentGoal[];
  careerAspiration: string;
  selfAssessment: string;
  managerFeedback?: string;
  hrNotes?: string;
}

// ─── Configs ───

export const COMPETENCY_CATEGORIES: Record<string, { label: string; color: string; bg: string }> = {
  core: { label: "Năng lực cốt lõi", color: "#990803", bg: "#99080312" },
  leadership: { label: "Năng lực lãnh đạo", color: "#c8a84e", bg: "#c8a84e15" },
  technical: { label: "Chuyên môn kỹ thuật", color: "#2563eb", bg: "#2563eb12" },
  soft_skill: { label: "Kỹ năng mềm", color: "#16a34a", bg: "#16a34a12" },
};

export const GOAL_STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; bg: string }> = {
  not_started: { label: "Chưa bắt đầu", color: "#64748b", bg: "#64748b12" },
  in_progress: { label: "Đang thực hiện", color: "#2563eb", bg: "#2563eb12" },
  completed: { label: "Hoàn thành", color: "#16a34a", bg: "#16a34a12" },
  overdue: { label: "Quá hạn", color: "#dc2626", bg: "#dc262612" },
  cancelled: { label: "Đã hủy", color: "#94a3b8", bg: "#94a3b812" },
};

export const PRIORITY_CONFIG: Record<GoalPriority, { label: string; color: string; bg: string }> = {
  critical: { label: "Ưu tiên cao nhất", color: "#dc2626", bg: "#dc262612" },
  high: { label: "Quan trọng", color: "#ea580c", bg: "#ea580c12" },
  medium: { label: "Bình thường", color: "#2563eb", bg: "#2563eb12" },
  low: { label: "Thấp", color: "#64748b", bg: "#64748b12" },
};

export const IDP_STATUS_CONFIG: Record<IDPStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Bản nháp", color: "#64748b", bg: "#64748b12" },
  pending_approval: { label: "Chờ phê duyệt", color: "#f59e0b", bg: "#f59e0b12" },
  approved: { label: "Đã duyệt", color: "#7c3aed", bg: "#7c3aed12" },
  in_progress: { label: "Đang thực hiện", color: "#2563eb", bg: "#2563eb12" },
  review: { label: "Đang đánh giá", color: "#ea580c", bg: "#ea580c12" },
  completed: { label: "Hoàn thành", color: "#16a34a", bg: "#16a34a12" },
};

export const ACTIVITY_TYPE_CONFIG: Record<ActivityType, { label: string; color: string; icon: string }> = {
  course: { label: "Khóa học", color: "#2563eb", icon: "📚" },
  mentoring: { label: "Mentoring", color: "#ec4899", icon: "💡" },
  project: { label: "Dự án thực tế", color: "#16a34a", icon: "🏗️" },
  certification: { label: "Chứng chỉ", color: "#c8a84e", icon: "🏆" },
  workshop: { label: "Hội thảo", color: "#7c3aed", icon: "🎯" },
  self_study: { label: "Tự học", color: "#64748b", icon: "📖" },
  coaching: { label: "Coaching", color: "#990803", icon: "🎓" },
  rotation: { label: "Luân chuyển", color: "#ea580c", icon: "🔄" },
};

export const LEVEL_LABELS: Record<CompetencyLevel, string> = {
  1: "Cơ bản",
  2: "Trung bình",
  3: "Khá",
  4: "Giỏi",
  5: "Xuất sắc",
};

// ─── Mock competency framework ───

export const GELEXIMCO_COMPETENCY_FRAMEWORK: Competency[] = [
  { id: "COMP01", name: "Tư duy chiến lược", category: "leadership", currentLevel: 3, targetLevel: 4, weight: 15 },
  { id: "COMP02", name: "Quản lý đội ngũ", category: "leadership", currentLevel: 2, targetLevel: 4, weight: 12 },
  { id: "COMP03", name: "Ra quyết định", category: "leadership", currentLevel: 3, targetLevel: 5, weight: 10 },
  { id: "COMP04", name: "Giao tiếp lãnh đạo", category: "soft_skill", currentLevel: 3, targetLevel: 4, weight: 10 },
  { id: "COMP05", name: "Kiến thức ngành BĐS", category: "technical", currentLevel: 4, targetLevel: 5, weight: 15 },
  { id: "COMP06", name: "Phân tích tài chính", category: "technical", currentLevel: 2, targetLevel: 4, weight: 12 },
  { id: "COMP07", name: "Quản lý dự án", category: "technical", currentLevel: 3, targetLevel: 4, weight: 10 },
  { id: "COMP08", name: "Đổi mới sáng tạo", category: "core", currentLevel: 2, targetLevel: 4, weight: 8 },
  { id: "COMP09", name: "Tuân thủ & Pháp luật", category: "core", currentLevel: 3, targetLevel: 4, weight: 8 },
];

// ─── Mock IDPs ───

export const MOCK_IDPS: IndividualDevelopmentPlan[] = [
  {
    id: "IDP001",
    employeeId: "EMP001",
    employeeName: "Nguyễn Minh Tuấn",
    employeeTitle: "Trưởng phòng Kinh doanh",
    employeeDept: "Phòng Kinh doanh",
    employeeSubsidiary: "BĐS Geleximco Land",
    employeeAvatar: "MT",
    managerId: "MGR001",
    managerName: "Trần Đức Mạnh",
    mentorId: "MEN001",
    mentorName: "GS. Nguyễn Văn Hùng",
    cycle: "Q1/2026",
    status: "in_progress",
    createdAt: "05/01/2026",
    updatedAt: "10/03/2026",
    overallProgress: 62,
    careerAspiration: "Phát triển lên vị trí Giám đốc Kinh doanh khu vực trong 18 tháng. Mong muốn dẫn dắt đội ngũ 30+ nhân viên và quản lý danh mục dự án 500+ tỷ.",
    selfAssessment: "Tôi có thế mạnh về kiến thức thị trường BĐS và quan hệ khách hàng. Cần cải thiện kỹ năng quản lý đội ngũ lớn và phân tích tài chính nâng cao.",
    managerFeedback: "Tuấn có tiềm năng lãnh đạo tốt, cần tập trung phát triển tư duy chiến lược và kỹ năng ra quyết định dựa trên dữ liệu. Đề xuất tham gia chương trình Executive Education.",
    competencies: [
      { id: "COMP01", name: "Tư duy chiến lược", category: "leadership", currentLevel: 3, targetLevel: 5, weight: 15 },
      { id: "COMP02", name: "Quản lý đội ngũ", category: "leadership", currentLevel: 3, targetLevel: 5, weight: 15 },
      { id: "COMP03", name: "Ra quyết định", category: "leadership", currentLevel: 3, targetLevel: 4, weight: 10 },
      { id: "COMP04", name: "Giao tiếp & Thuyết trình", category: "soft_skill", currentLevel: 4, targetLevel: 5, weight: 10 },
      { id: "COMP05", name: "Kiến thức BĐS", category: "technical", currentLevel: 4, targetLevel: 5, weight: 15 },
      { id: "COMP06", name: "Phân tích tài chính", category: "technical", currentLevel: 2, targetLevel: 4, weight: 15 },
      { id: "COMP07", name: "Quản lý dự án", category: "technical", currentLevel: 3, targetLevel: 4, weight: 10 },
      { id: "COMP08", name: "Đổi mới sáng tạo", category: "core", currentLevel: 3, targetLevel: 4, weight: 10 },
    ],
    goals: [
      {
        id: "G001",
        title: "Hoàn thành khóa Kỹ năng Lãnh đạo Cấp trung",
        description: "Tham gia và hoàn thành khóa đào tạo chuyên sâu về kỹ năng lãnh đạo, quản lý đội ngũ và ra quyết định chiến lược",
        competencyIds: ["COMP01", "COMP02", "COMP03"],
        status: "completed",
        priority: "critical",
        startDate: "10/01/2026",
        targetDate: "28/02/2026",
        progress: 100,
        managerNotes: "Tuấn đã hoàn thành xuất sắc, điểm 92/100.",
        activities: [
          { id: "A001", type: "course", title: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung", description: "Khóa 40h — Module 1-6", status: "completed", dueDate: "28/02/2026", completedDate: "25/02/2026", linkedCourseId: "C001", hours: 40 },
          { id: "A002", type: "workshop", title: "Workshop: Leadership in Action", description: "Buổi thực hành lãnh đạo thực tế tại VP Tập đoàn", status: "completed", dueDate: "15/02/2026", completedDate: "15/02/2026", hours: 8 },
        ],
      },
      {
        id: "G002",
        title: "Nâng cao Phân tích Tài chính Doanh nghiệp",
        description: "Đạt trình độ thành thạo trong phân tích tài chính: đọc báo cáo, phân tích dòng tiền, định giá dự án BĐS",
        competencyIds: ["COMP06"],
        status: "in_progress",
        priority: "high",
        startDate: "01/02/2026",
        targetDate: "30/04/2026",
        progress: 45,
        activities: [
          { id: "A003", type: "course", title: "Phân tích Tài chính Doanh nghiệp", description: "Khóa e-learning 30h trên LMS", status: "in_progress", dueDate: "31/03/2026", linkedCourseId: "C003", hours: 30 },
          { id: "A004", type: "project", title: "Phân tích Dự án Le Grand Jardin", description: "Thực hành phân tích tài chính trên dự án thực tế", status: "not_started", dueDate: "30/04/2026", hours: 20 },
          { id: "A005", type: "mentoring", title: "Mentoring với CFO ABBank", description: "4 phiên mentoring về phân tích tài chính BĐS", status: "in_progress", dueDate: "30/04/2026", linkedMentorId: "MEN002", hours: 8 },
        ],
      },
      {
        id: "G003",
        title: "Chứng chỉ Quản lý Dự án PMP",
        description: "Đạt chứng chỉ PMP (Project Management Professional) từ PMI",
        competencyIds: ["COMP07"],
        status: "in_progress",
        priority: "high",
        startDate: "15/01/2026",
        targetDate: "30/06/2026",
        progress: 30,
        activities: [
          { id: "A006", type: "course", title: "Quản lý Dự án theo chuẩn PMI", description: "Khóa đào tạo 35h trên LMS", status: "in_progress", dueDate: "30/04/2026", linkedCourseId: "C005", hours: 35 },
          { id: "A007", type: "self_study", title: "PMBOK Guide 7th Edition", description: "Tự học sách PMBOK phiên bản mới nhất", status: "in_progress", dueDate: "31/05/2026", hours: 40 },
          { id: "A008", type: "certification", title: "Thi chứng chỉ PMP", description: "Đăng ký và thi PMP tại Pearson VUE", status: "not_started", dueDate: "30/06/2026", hours: 4 },
        ],
      },
      {
        id: "G004",
        title: "Phát triển Tư duy Đổi mới Sáng tạo",
        description: "Rèn luyện khả năng tư duy sáng tạo, áp dụng Design Thinking và Lean Startup vào kinh doanh BĐS",
        competencyIds: ["COMP08"],
        status: "not_started",
        priority: "medium",
        startDate: "01/04/2026",
        targetDate: "30/06/2026",
        progress: 0,
        activities: [
          { id: "A009", type: "workshop", title: "Design Thinking Workshop", description: "2-day workshop với chuyên gia từ RMIT", status: "not_started", dueDate: "15/04/2026", hours: 16 },
          { id: "A010", type: "coaching", title: "Innovation Coaching", description: "6 phiên coaching với Innovation Lead Tập đoàn", status: "not_started", dueDate: "30/06/2026", hours: 12 },
        ],
      },
    ],
  },
  {
    id: "IDP002",
    employeeId: "EMP002",
    employeeName: "Lê Thị Hồng Nhung",
    employeeTitle: "Chuyên viên Pháp chế",
    employeeDept: "Phòng Pháp chế",
    employeeSubsidiary: "VP Tập đoàn Geleximco",
    employeeAvatar: "HN",
    managerId: "MGR002",
    managerName: "Phạm Văn Tùng",
    cycle: "Q1/2026",
    status: "approved",
    createdAt: "10/01/2026",
    updatedAt: "05/03/2026",
    overallProgress: 38,
    careerAspiration: "Trở thành Trưởng phòng Pháp chế trong 2 năm. Chuyên sâu về M&A và Compliance trong lĩnh vực BĐS - Ngân hàng.",
    selfAssessment: "Kiến thức pháp luật vững, cần bổ sung kỹ năng quản lý và giao tiếp đa phòng ban.",
    competencies: [
      { id: "C01", name: "Luật Doanh nghiệp", category: "technical", currentLevel: 4, targetLevel: 5, weight: 20 },
      { id: "C02", name: "M&A & Due Diligence", category: "technical", currentLevel: 2, targetLevel: 4, weight: 20 },
      { id: "C03", name: "Tuân thủ & Compliance", category: "core", currentLevel: 3, targetLevel: 5, weight: 15 },
      { id: "C04", name: "Kỹ năng đàm phán", category: "soft_skill", currentLevel: 3, targetLevel: 4, weight: 15 },
      { id: "C05", name: "Quản lý đội ngũ", category: "leadership", currentLevel: 2, targetLevel: 3, weight: 15 },
      { id: "C06", name: "Tư duy phân tích", category: "core", currentLevel: 3, targetLevel: 4, weight: 15 },
    ],
    goals: [
      {
        id: "G010",
        title: "Chuyên sâu M&A cho BĐS",
        description: "Nắm vững quy trình M&A, due diligence pháp lý cho giao dịch BĐS",
        competencyIds: ["C02"],
        status: "in_progress",
        priority: "critical",
        startDate: "15/01/2026",
        targetDate: "30/04/2026",
        progress: 40,
        activities: [
          { id: "A020", type: "course", title: "M&A Fundamentals", description: "Khóa online 20h", status: "completed", dueDate: "28/02/2026", completedDate: "25/02/2026", hours: 20 },
          { id: "A021", type: "project", title: "Hỗ trợ due diligence dự án Crystal Bay", description: "Tham gia thực tế", status: "in_progress", dueDate: "30/04/2026", hours: 40 },
        ],
      },
      {
        id: "G011",
        title: "Khóa Tuân thủ Pháp luật DN nâng cao",
        description: "Hoàn thành khóa đào tạo và đạt chứng chỉ compliance",
        competencyIds: ["C03"],
        status: "in_progress",
        priority: "high",
        startDate: "01/02/2026",
        targetDate: "31/03/2026",
        progress: 60,
        activities: [
          { id: "A022", type: "course", title: "Tuân thủ Pháp luật Doanh nghiệp", description: "Khóa 25h trên LMS", status: "in_progress", dueDate: "20/03/2026", linkedCourseId: "C007", hours: 25 },
          { id: "A023", type: "certification", title: "Chứng chỉ Compliance Officer", description: "Thi lấy chứng chỉ", status: "not_started", dueDate: "31/03/2026", hours: 4 },
        ],
      },
    ],
  },
  {
    id: "IDP003",
    employeeId: "EMP003",
    employeeName: "Trần Văn Đức",
    employeeTitle: "Nhân viên Marketing",
    employeeDept: "Phòng Marketing",
    employeeSubsidiary: "BĐS Geleximco Land",
    employeeAvatar: "VĐ",
    managerId: "MGR003",
    managerName: "Nguyễn Thị Mai",
    cycle: "Q1/2026",
    status: "pending_approval",
    createdAt: "01/03/2026",
    updatedAt: "08/03/2026",
    overallProgress: 0,
    careerAspiration: "Chuyên sâu Digital Marketing, hướng tới vị trí Marketing Team Lead trong 12 tháng.",
    selfAssessment: "Có kiến thức nền tảng marketing tốt, cần phát triển mạnh hơn về SEO, Performance Marketing và phân tích dữ liệu.",
    competencies: [
      { id: "C10", name: "Digital Marketing", category: "technical", currentLevel: 2, targetLevel: 4, weight: 25 },
      { id: "C11", name: "Content Strategy", category: "technical", currentLevel: 3, targetLevel: 4, weight: 20 },
      { id: "C12", name: "Phân tích dữ liệu", category: "technical", currentLevel: 1, targetLevel: 3, weight: 20 },
      { id: "C13", name: "Giao tiếp", category: "soft_skill", currentLevel: 3, targetLevel: 4, weight: 15 },
      { id: "C14", name: "Sáng tạo nội dung", category: "core", currentLevel: 3, targetLevel: 5, weight: 20 },
    ],
    goals: [
      {
        id: "G020",
        title: "Hoàn thành khóa Marketing số & Truyền thông",
        description: "Nắm vững Digital Marketing: SEO, SEM, Social Media, Email Marketing",
        competencyIds: ["C10"],
        status: "not_started",
        priority: "critical",
        startDate: "15/03/2026",
        targetDate: "30/05/2026",
        progress: 0,
        activities: [
          { id: "A030", type: "course", title: "Marketing số & Truyền thông Thương hiệu", description: "Khóa 35h trên LMS", status: "not_started", dueDate: "30/04/2026", linkedCourseId: "C004", hours: 35 },
          { id: "A031", type: "self_study", title: "Google Analytics Certification", description: "Tự học và thi chứng chỉ GA4", status: "not_started", dueDate: "30/05/2026", hours: 20 },
        ],
      },
    ],
  },
  {
    id: "IDP004",
    employeeId: "EMP004",
    employeeName: "Phạm Thùy Linh",
    employeeTitle: "Chuyên viên Tuyển dụng",
    employeeDept: "Phòng Nhân sự",
    employeeSubsidiary: "Ngân hàng ABBank",
    employeeAvatar: "TL",
    managerId: "MGR004",
    managerName: "Đỗ Thanh Hương",
    cycle: "Q1/2026",
    status: "completed",
    createdAt: "02/01/2026",
    updatedAt: "28/02/2026",
    overallProgress: 100,
    careerAspiration: "Phát triển lên HR Business Partner, kết nối chiến lược nhân sự với mục tiêu kinh doanh.",
    selfAssessment: "Tuyển dụng là thế mạnh, cần bổ sung kiến thức về OD, C&B và chiến lược HR tổng thể.",
    competencies: [
      { id: "C20", name: "Tuyển dụng", category: "technical", currentLevel: 4, targetLevel: 5, weight: 20 },
      { id: "C21", name: "HR Strategy", category: "leadership", currentLevel: 2, targetLevel: 4, weight: 25 },
      { id: "C22", name: "Luật Lao động", category: "technical", currentLevel: 3, targetLevel: 4, weight: 15 },
      { id: "C23", name: "Coaching", category: "soft_skill", currentLevel: 3, targetLevel: 4, weight: 20 },
      { id: "C24", name: "Phân tích dữ liệu HR", category: "technical", currentLevel: 2, targetLevel: 3, weight: 20 },
    ],
    goals: [
      {
        id: "G030",
        title: "Chương trình HRBP Development",
        description: "Hoàn thành chương trình đào tạo HRBP nội bộ",
        competencyIds: ["C21"],
        status: "completed",
        priority: "critical",
        startDate: "10/01/2026",
        targetDate: "28/02/2026",
        progress: 100,
        activities: [
          { id: "A040", type: "course", title: "HRBP Essentials", description: "Khóa 30h", status: "completed", dueDate: "15/02/2026", completedDate: "12/02/2026", hours: 30 },
          { id: "A041", type: "rotation", title: "Luân chuyển Phòng C&B", description: "2 tuần thực tập tại Phòng C&B", status: "completed", dueDate: "28/02/2026", completedDate: "28/02/2026", hours: 80 },
        ],
      },
    ],
  },
  {
    id: "IDP005",
    employeeId: "EMP005",
    employeeName: "Hoàng Đức Thịnh",
    employeeTitle: "Kỹ sư Xây dựng",
    employeeDept: "Phòng Kỹ thuật",
    employeeSubsidiary: "Geleximco Construction",
    employeeAvatar: "ĐT",
    managerId: "MGR005",
    managerName: "Lê Quốc Vương",
    cycle: "Q1/2026",
    status: "review",
    createdAt: "08/01/2026",
    updatedAt: "09/03/2026",
    overallProgress: 78,
    careerAspiration: "Trở thành Chỉ huy trưởng công trình, quản lý dự án xây dựng quy mô lớn.",
    selfAssessment: "Kỹ năng kỹ thuật tốt, cần phát triển khả năng quản lý tiến độ và giao tiếp với các bên liên quan.",
    competencies: [
      { id: "C30", name: "Kỹ thuật xây dựng", category: "technical", currentLevel: 4, targetLevel: 5, weight: 25 },
      { id: "C31", name: "Quản lý tiến độ", category: "technical", currentLevel: 3, targetLevel: 5, weight: 20 },
      { id: "C32", name: "An toàn lao động", category: "core", currentLevel: 3, targetLevel: 5, weight: 20 },
      { id: "C33", name: "Giao tiếp công trường", category: "soft_skill", currentLevel: 2, targetLevel: 4, weight: 15 },
      { id: "C34", name: "BIM & Công nghệ mới", category: "technical", currentLevel: 2, targetLevel: 4, weight: 20 },
    ],
    goals: [
      {
        id: "G040",
        title: "Chứng chỉ An toàn Lao động nâng cao",
        description: "Đạt chứng chỉ ATLĐ cấp cao và giám sát viên ATLĐ",
        competencyIds: ["C32"],
        status: "completed",
        priority: "critical",
        startDate: "10/01/2026",
        targetDate: "28/02/2026",
        progress: 100,
        activities: [
          { id: "A050", type: "course", title: "An toàn Lao động & PCCC", description: "Khóa 20h bắt buộc", status: "completed", dueDate: "20/02/2026", completedDate: "18/02/2026", hours: 20 },
          { id: "A051", type: "certification", title: "Chứng chỉ Giám sát ATLĐ", description: "Thi và đạt chứng chỉ", status: "completed", dueDate: "28/02/2026", completedDate: "26/02/2026", hours: 4 },
        ],
      },
      {
        id: "G041",
        title: "BIM Revit cho Kỹ sư hiện trường",
        description: "Sử dụng thành thạo BIM Revit để quản lý bản vẽ và phối hợp công trường",
        competencyIds: ["C34"],
        status: "in_progress",
        priority: "high",
        startDate: "01/02/2026",
        targetDate: "30/04/2026",
        progress: 55,
        activities: [
          { id: "A052", type: "course", title: "BIM Revit Cơ bản", description: "Khóa 25h", status: "completed", dueDate: "15/03/2026", completedDate: "10/03/2026", hours: 25 },
          { id: "A053", type: "project", title: "Áp dụng BIM vào Dự án Anland 3", description: "Thực hành trên dự án thực tế", status: "in_progress", dueDate: "30/04/2026", hours: 30 },
        ],
      },
    ],
  },
];

// ─── Helpers ───

export function getIDPStats() {
  const total = MOCK_IDPS.length;
  const inProgress = MOCK_IDPS.filter(i => i.status === "in_progress").length;
  const completed = MOCK_IDPS.filter(i => i.status === "completed").length;
  const avgProgress = Math.round(MOCK_IDPS.reduce((s, i) => s + i.overallProgress, 0) / Math.max(total, 1));
  return { total, inProgress, completed, avgProgress };
}
