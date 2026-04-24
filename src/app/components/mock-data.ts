// ============================================
// GELEXIMCO LMS - Mock Data & Types
// Senior BA Analysis: Data models cho hệ thống LMS nội bộ
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  subsidiary: string;
  role: "admin" | "manager" | "instructor" | "learner";
  position: string;
  joinDate: string;
  coursesCompleted: number;
  totalHours: number;
  certifications: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  subsidiary: string;
  instructor: string;
  duration: string;
  totalLessons: number;
  enrolledCount: number;
  completionRate: number;
  rating: number;
  level: "Cơ bản" | "Trung cấp" | "Nâng cao";
  status: "active" | "draft" | "archived";
  mandatory: boolean;
  createdAt: string;
  tags: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: string[];
  totalDuration: string;
  department: string;
  enrolledCount: number;
  completionRate: number;
  level: string;
}

export interface Certificate {
  id: string;
  courseName: string;
  userName: string;
  issuedDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
  certificateNo: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "deadline";
  time: string;
  read: boolean;
}

// ============================================
// CẤU TRÚC TẬP ĐOÀN GELEXIMCO
// Tên đầy đủ: Công ty Cổ phần Xuất Nhập khẩu Tổng hợp Hà Nội
// Thành lập: 1993 | Trụ sở: 36 Hoàng Cầu, Đống Đa, Hà Nội
// ============================================

// Lĩnh vực kinh doanh chính của Tập đoàn
export const BUSINESS_SECTORS = [
  { id: "finance", name: "Tài chính - Ngân hàng", color: "#2e86de", icon: "🏦" },
  { id: "realestate", name: "Bất động sản", color: "#27ae60", icon: "🏗️" },
  { id: "materials", name: "Vật liệu Xây dựng", color: "#e67e22", icon: "🏭" },
  { id: "mining", name: "Khoáng sản", color: "#8e44ad", icon: "⛏️" },
  { id: "energy", name: "Năng lượng", color: "#f39c12", icon: "⚡" },
  { id: "infrastructure", name: "Hạ tầng", color: "#16a085", icon: "🛣️" },
  { id: "industry", name: "Công nghiệp", color: "#c0392b", icon: "🔧" },
  { id: "trade", name: "Thương mại - XNK", color: "#2980b9", icon: "📦" },
  { id: "education", name: "Giáo dục", color: "#1abc9c", icon: "🎓" },
  { id: "holding", name: "Tập đoàn (Holding)", color: "#990803", icon: "🏢" },
];

// Công ty thành viên / Đơn vị trực thuộc
export const SUBSIDIARIES = [
  "Tập đoàn Geleximco",               // VP Holding - 36 Hoàng Cầu, HN
  "Ngân hàng TMCP An Bình (ABBank)",   // Tài chính - Ngân hàng
  "Chứng khoán An Bình (ABS)",         // Chứng khoán
  "Bảo hiểm AAA",                      // Bảo hiểm
  "Xi măng Thăng Long",                // VLXD - Quảng Ninh
  "Khoáng sản Geleximco",              // Khoáng sản - Quảng Ninh, Hà Giang
  "Nhiệt điện Thăng Long",             // Năng lượng - Quảng Ninh (2x300MW)
  "Geleximco Năng lượng Tái tạo",      // Điện gió/mặt trời - Quảng Trị, Gia Lai
  "BĐS Geleximco - KĐT Lê Trọng Tấn", // BĐS - 272ha, Hà Đông
  "BĐS Geleximco - KĐT An Khánh",     // BĐS - Hoài Đức
  "BĐS Geleximco - KĐT Dương Nội",    // BĐS - Hà Đông
  "KCN Quang Minh",                    // Hạ tầng CN - Mê Linh
  "Geleximco Thương mại & XNK",        // Thương mại truyền thống
  "Geleximco Giáo dục",                // Đầu tư giáo dục
];

// Mapping Công ty → Lĩnh vực
export const SUBSIDIARY_SECTOR_MAP: Record<string, string> = {
  "Tập đoàn Geleximco": "holding",
  "Ngân hàng TMCP An Bình (ABBank)": "finance",
  "Chứng khoán An Bình (ABS)": "finance",
  "Bảo hiểm AAA": "finance",
  "Xi măng Thăng Long": "materials",
  "Khoáng sản Geleximco": "mining",
  "Nhiệt điện Thăng Long": "energy",
  "Geleximco Năng lượng Tái tạo": "energy",
  "BĐS Geleximco - KĐT Lê Trọng Tấn": "realestate",
  "BĐS Geleximco - KĐT An Khánh": "realestate",
  "BĐS Geleximco - KĐT Dương Nội": "realestate",
  "KCN Quang Minh": "infrastructure",
  "Geleximco Thương mại & XNK": "trade",
  "Geleximco Giáo dục": "education",
};

// Khối/Phòng ban theo cấu trúc tập đoàn đa ngành
export const DEPARTMENTS = [
  // Khối Tập đoàn (Holding)
  "Ban Giám đốc Tập đoàn",
  "Ban Chiến lược & Phát triển",
  "Ban Nhân sự Tập đoàn",
  "Ban Tài chính Tập đoàn",
  "Ban Pháp chế & Tuân thủ",
  "Ban CNTT & Chuyển đổi số",
  "Ban Kiểm soát Nội bộ",
  "Ban Truyền thông & Thương hiệu",
  "Ban Hành chính Tổng hợp",
  // Khối Tài chính - Ngân hàng
  "Khối Ngân hàng Bán lẻ",
  "Khối Ngân hàng Doanh nghiệp",
  "Khối Quản trị Rủi ro",
  "Khối Tín dụng",
  "Khối Giao dịch & Dịch vụ KH",
  // Khối BĐS
  "Ban Kinh doanh BĐS",
  "Ban Quy hoạch & Thiết kế",
  "Ban Quản lý Dự án BĐS",
  "Ban Marketing BĐS",
  // Khối Sản xuất & Khoáng sản
  "Phân xưởng Sản xuất",
  "Ban Kỹ thuật - Vận hành",
  "Ban An toàn Mỏ & Lao động",
  "Ban Quản lý Chất lượng (QC)",
  "Ban Địa chất & Thăm dò",
  // Khối Năng lượng
  "Ban Vận hành Nhà máy Điện",
  "Ban Kỹ thuật Điện",
  "Ban Bảo trì & Sửa chữa",
  // Chung
  "Kế toán - Tài chính",
  "Kinh doanh",
  "Marketing",
  "Nhân sự",
  "IT & Công nghệ",
  "Kỹ thuật",
];

// Danh mục đào tạo phù hợp tập đoàn đa ngành
export const CATEGORIES = [
  "Kỹ năng Lãnh đạo & Quản trị",
  "Nghiệp vụ Ngân hàng & Tín dụng",
  "Quản trị Rủi ro & Kiểm soát Nội bộ",
  "An toàn Mỏ & Khai khoáng",
  "An toàn Xây dựng & Công trường",
  "ATVSLĐ - An toàn Vệ sinh Lao động",
  "Vận hành Nhà máy Điện",
  "Quản lý Dự án BĐS & Hạ tầng",
  "Tài chính & Kế toán Doanh nghiệp",
  "Marketing & Truyền thông Thương hiệu",
  "Tuân thủ Pháp luật & Phòng chống Tham nhũng",
  "CNTT & Chuyển đổi số",
  "ESG & Phát triển Bền vững",
  "Onboarding & Văn hóa Tập đoàn",
  "Kỹ năng mềm & Phát triển Cá nhân",
  "Quản lý Chất lượng (ISO/QC)",
  "Kỹ thuật Xi măng & VLXD",
  "Năng lượng Tái tạo & Môi trường",
];

export const courseImages = [
  "https://images.unsplash.com/photo-1758691736067-b309ee3ef7b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0cmFpbmluZyUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NzMwMjM3ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1762968274962-20c12e6e8ecd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGxlYWRlcnNoaXAlMjBzZW1pbmFyfGVufDF8fHx8MTc3MzAyMzc4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1758272421243-3213b95006e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwd29ya3Nob3B8ZW58MXx8fHwxNzczMDIzNzg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1565688527174-775059ac429c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBjb21wbGlhbmNlJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzczMDIzNzg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzcyOTQ4OTYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1743385779347-1549dabf1320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0JTIwbWFuYWdlbWVudCUyMHdoaXRlYm9hcmR8ZW58MXx8fHwxNzczMDIzNzg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1762341114530-a0c54d8cc18b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBhbmFseXNpcyUyMHNwcmVhZHNoZWV0fGVufDF8fHx8MTc3MzAyMzc4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1702392183172-17fdef8002b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWZldHklMjB0cmFpbmluZyUyMGNvbnN0cnVjdGlvbnxlbnwxfHx8fDE3NzMwMjM3ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

export const mockCourses: Course[] = [
  {
    id: "C001",
    title: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung",
    description: "Chương trình phát triển năng lực lãnh đạo toàn diện dành cho cấp quản lý trung gian, bao gồm ra quyết định, giao tiếp chiến lược và quản lý hiệu suất đội nhóm.",
    thumbnail: courseImages[1],
    category: "Kỹ năng lãnh đạo",
    subsidiary: "Tập đoàn Geleximco",
    instructor: "TS. Nguyễn Văn Hùng",
    duration: "24 giờ",
    totalLessons: 18,
    enrolledCount: 245,
    completionRate: 78,
    rating: 4.8,
    level: "Nâng cao",
    status: "active",
    mandatory: true,
    createdAt: "2025-10-15",
    tags: ["Leadership", "Management", "Strategy"],
  },
  {
    id: "C002",
    title: "An toàn Lao động trong Xây dựng & Khai khoáng",
    description: "Khóa huấn luyện bắt buộc về an toàn lao động theo quy chuẩn quốc gia, áp dụng cho tất cả nhân sự thuộc khối xây dựng và khai khoáng.",
    thumbnail: courseImages[7],
    category: "An toàn lao động",
    subsidiary: "Khoáng sản Geleximco",
    instructor: "KS. Trần Minh Đức",
    duration: "16 giờ",
    totalLessons: 12,
    enrolledCount: 520,
    completionRate: 92,
    rating: 4.6,
    level: "Cơ bản",
    status: "active",
    mandatory: true,
    createdAt: "2025-08-20",
    tags: ["Safety", "Compliance", "Construction"],
  },
  {
    id: "C003",
    title: "Phân tích Tài chính Doanh nghiệp",
    description: "Nâng cao kỹ năng phân tích báo cáo tài chính, đánh giá hiệu quả đầu tư và quản trị rủi ro tài chính cho khối ngân hàng và tài chính.",
    thumbnail: courseImages[6],
    category: "Tài chính & Kế toán",
    subsidiary: "ABBank",
    instructor: "ThS. Lê Thị Thu Hà",
    duration: "20 giờ",
    totalLessons: 15,
    enrolledCount: 180,
    completionRate: 65,
    rating: 4.7,
    level: "Trung cấp",
    status: "active",
    mandatory: false,
    createdAt: "2025-11-01",
    tags: ["Finance", "Analysis", "Banking"],
  },
  {
    id: "C004",
    title: "Marketing số & Truyền thông Thương hiệu",
    description: "Chiến lược marketing số toàn diện: SEO/SEM, Social Media, Content Marketing và quản trị thương hiệu doanh nghiệp trong kỷ nguyên số.",
    thumbnail: courseImages[2],
    category: "Marketing & Truyền thông",
    subsidiary: "BĐS An Khánh",
    instructor: "ThS. Phạm Anh Tuấn",
    duration: "18 giờ",
    totalLessons: 14,
    enrolledCount: 312,
    completionRate: 71,
    rating: 4.5,
    level: "Trung cấp",
    status: "active",
    mandatory: false,
    createdAt: "2025-09-12",
    tags: ["Marketing", "Digital", "Branding"],
  },
  {
    id: "C005",
    title: "Quản lý Dự án theo chuẩn PMI",
    description: "Áp dụng phương pháp quản lý dự án theo chuẩn PMBOK, bao gồm Agile, Scrum và Waterfall cho các dự án BĐS và hạ tầng quy mô lớn.",
    thumbnail: courseImages[5],
    category: "Quản lý dự án",
    subsidiary: "BĐS Lê Trọng Tấn",
    instructor: "PMP. Hoàng Đình Nam",
    duration: "30 giờ",
    totalLessons: 22,
    enrolledCount: 156,
    completionRate: 58,
    rating: 4.9,
    level: "Nâng cao",
    status: "active",
    mandatory: false,
    createdAt: "2025-07-20",
    tags: ["PMP", "Agile", "Scrum"],
  },
  {
    id: "C006",
    title: "Onboarding - Chào mừng Thành viên mới",
    description: "Chương trình hội nhập toàn diện: giới thiệu văn hóa doanh nghiệp, quy trình nội bộ, chính sách phúc lợi và định hướng phát triển nghề nghiệp tại Geleximco.",
    thumbnail: courseImages[0],
    category: "Onboarding",
    subsidiary: "Tập đoàn Geleximco",
    instructor: "HR Team",
    duration: "8 giờ",
    totalLessons: 6,
    enrolledCount: 890,
    completionRate: 95,
    rating: 4.4,
    level: "Cơ bản",
    status: "active",
    mandatory: true,
    createdAt: "2025-01-01",
    tags: ["Onboarding", "Culture", "HR"],
  },
  {
    id: "C007",
    title: "Tuân thủ Pháp luật Doanh nghiệp",
    description: "Cập nhật các quy định pháp luật mới nhất về doanh nghiệp, lao động, thuế và phòng chống tham nhũng áp dụng cho toàn tập đoàn.",
    thumbnail: courseImages[3],
    category: "Tuân thủ & Pháp luật",
    subsidiary: "Tập đoàn Geleximco",
    instructor: "LS. Nguyễn Thị Lan",
    duration: "12 giờ",
    totalLessons: 10,
    enrolledCount: 1240,
    completionRate: 88,
    rating: 4.3,
    level: "Cơ bản",
    status: "active",
    mandatory: true,
    createdAt: "2025-06-15",
    tags: ["Compliance", "Legal", "Corporate"],
  },
  {
    id: "C008",
    title: "Kỹ năng Teamwork & Giao tiếp Hiệu quả",
    description: "Xây dựng đội nhóm hiệu quả, kỹ năng giao tiếp trong môi trường doanh nghiệp, giải quyết xung đột và đàm phán.",
    thumbnail: courseImages[4],
    category: "Kỹ năng mềm",
    subsidiary: "Tập đoàn Geleximco",
    instructor: "ThS. Vũ Minh Châu",
    duration: "10 giờ",
    totalLessons: 8,
    enrolledCount: 678,
    completionRate: 82,
    rating: 4.6,
    level: "Cơ bản",
    status: "active",
    mandatory: false,
    createdAt: "2025-11-20",
    tags: ["Teamwork", "Communication", "Soft Skills"],
  },
];

export const mockLearningPaths: LearningPath[] = [
  {
    id: "LP001",
    title: "Lộ trình Quản lý Cấp trung",
    description: "Phát triển toàn diện năng lực quản lý cho các Team Lead và Manager mới được bổ nhiệm.",
    courses: ["C001", "C005", "C008"],
    totalDuration: "64 giờ",
    department: "Ban Giám đốc",
    enrolledCount: 89,
    completionRate: 45,
    level: "Nâng cao",
  },
  {
    id: "LP002",
    title: "Lộ trình Nhân sự mới",
    description: "Chương trình hội nhập bắt buộc cho tất cả nhân viên mới gia nhập tập đoàn.",
    courses: ["C006", "C007", "C008"],
    totalDuration: "30 giờ",
    department: "Nhân sự",
    enrolledCount: 340,
    completionRate: 88,
    level: "Cơ bản",
  },
  {
    id: "LP003",
    title: "Lộ trình Chuyên viên Tài chính",
    description: "Nâng cao chuyên môn nghiệp vụ cho khối ngân hàng và tài chính.",
    courses: ["C003", "C007"],
    totalDuration: "32 giờ",
    department: "Tài chính - Kế toán",
    enrolledCount: 120,
    completionRate: 62,
    level: "Trung cấp",
  },
  {
    id: "LP004",
    title: "Lộ trình An toàn & Tuân thủ",
    description: "Đào tạo bắt buộc về an toàn lao động và tuân thủ pháp luật cho khối sản xuất.",
    courses: ["C002", "C007"],
    totalDuration: "28 giờ",
    department: "Kỹ thuật",
    enrolledCount: 560,
    completionRate: 91,
    level: "Cơ bản",
  },
];

export const mockCertificates: Certificate[] = [
  { id: "CERT001", courseName: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung", userName: "Nguyễn Văn A", issuedDate: "2025-12-15", expiryDate: "2026-12-15", status: "valid", certificateNo: "GEL-LD-2025-001" },
  { id: "CERT002", courseName: "An toàn Lao động trong Xây dựng & Khai khoáng", userName: "Trần Thị B", issuedDate: "2025-11-20", expiryDate: "2026-05-20", status: "expiring", certificateNo: "GEL-AT-2025-045" },
  { id: "CERT003", courseName: "Tuân thủ Pháp luật Doanh nghiệp", userName: "Lê Hoàng C", issuedDate: "2025-01-10", expiryDate: "2026-01-10", status: "expired", certificateNo: "GEL-PL-2025-102" },
  { id: "CERT004", courseName: "Onboarding - Chào mừng Thành viên mới", userName: "Phạm Minh D", issuedDate: "2026-01-05", expiryDate: "2027-01-05", status: "valid", certificateNo: "GEL-OB-2026-012" },
  { id: "CERT005", courseName: "Phân tích Tài chính Doanh nghiệp", userName: "Hoàng Thị E", issuedDate: "2025-10-30", expiryDate: "2026-10-30", status: "valid", certificateNo: "GEL-TC-2025-078" },
  { id: "CERT006", courseName: "Marketing số & Truyền thông Thương hiệu", userName: "Vũ Đức F", issuedDate: "2025-08-15", expiryDate: "2026-08-15", status: "valid", certificateNo: "GEL-MK-2025-034" },
];

export const mockEmployees: User[] = [
  { id: "E001", name: "Nguyễn Văn Minh", email: "minh.nv@geleximco.vn", avatar: "", department: "Ban Giám đốc", subsidiary: "Tập đoàn Geleximco", role: "admin", position: "Giám đốc Đào tạo", joinDate: "2018-03-15", coursesCompleted: 42, totalHours: 380, certifications: 12 },
  { id: "E002", name: "Trần Thị Hương", email: "huong.tt@geleximco.vn", avatar: "", department: "Nhân sự", subsidiary: "Tập đoàn Geleximco", role: "manager", position: "Trưởng phòng Nhân sự", joinDate: "2019-06-20", coursesCompleted: 35, totalHours: 290, certifications: 8 },
  { id: "E003", name: "Lê Hoàng Nam", email: "nam.lh@abbank.com.vn", avatar: "", department: "Tài chính - Kế toán", subsidiary: "ABBank", role: "learner", position: "Chuyên viên Tài chính", joinDate: "2021-01-10", coursesCompleted: 18, totalHours: 150, certifications: 5 },
  { id: "E004", name: "Phạm Anh Tuấn", email: "tuan.pa@geleximco.vn", avatar: "", department: "Marketing", subsidiary: "BĐS An Khánh", role: "instructor", position: "Trưởng nhóm Marketing", joinDate: "2020-04-05", coursesCompleted: 28, totalHours: 220, certifications: 7 },
  { id: "E005", name: "Hoàng Thị Lan", email: "lan.ht@geleximco.vn", avatar: "", department: "Pháp chế", subsidiary: "Tập đoàn Geleximco", role: "instructor", position: "Trưởng Ban Pháp chế", joinDate: "2017-09-01", coursesCompleted: 45, totalHours: 410, certifications: 15 },
  { id: "E006", name: "Vũ Đức Thắng", email: "thang.vd@geleximco.vn", avatar: "", department: "Kỹ thuật", subsidiary: "Khoáng sản Geleximco", role: "learner", position: "Kỹ sư Khai thác", joinDate: "2022-07-12", coursesCompleted: 12, totalHours: 95, certifications: 4 },
  { id: "E007", name: "Đỗ Minh Châu", email: "chau.dm@geleximco.vn", avatar: "", department: "IT & Công nghệ", subsidiary: "Tập đoàn Geleximco", role: "manager", position: "Giám đốc CNTT", joinDate: "2019-11-25", coursesCompleted: 32, totalHours: 260, certifications: 10 },
  { id: "E008", name: "Ngô Thị Mai", email: "mai.nt@geleximco.vn", avatar: "", department: "Kinh doanh", subsidiary: "BĐS Lê Trọng Tấn", role: "learner", position: "Trưởng phòng Kinh doanh", joinDate: "2020-08-18", coursesCompleted: 22, totalHours: 175, certifications: 6 },
];

export const mockNotifications: Notification[] = [
  { id: "N001", title: "Deadline khóa học", message: "Khóa 'Tuân thủ Pháp luật DN' cần hoàn thành trước 15/03/2026", type: "deadline", time: "2 giờ trước", read: false },
  { id: "N002", title: "Khóa học mới", message: "Khóa 'AI trong Quản trị Doanh nghiệp' vừa được mở đăng ký", type: "info", time: "5 giờ trước", read: false },
  { id: "N003", title: "Chứng chỉ sắp hết hạn", message: "Chứng chỉ 'An toàn LĐ' của 45 nhân viên sẽ hết hạn trong 30 ngày", type: "warning", time: "1 ngày trước", read: false },
  { id: "N004", title: "Hoàn thành khóa học", message: "Bạn đã hoàn thành khóa 'Kỹ năng Teamwork & Giao tiếp'", type: "success", time: "2 ngày trước", read: true },
];

// Dashboard Analytics
export const monthlyLearningData = [
  { month: "T1", hours: 1250, courses: 45, completions: 38 },
  { month: "T2", hours: 1480, courses: 52, completions: 44 },
  { month: "T3", hours: 1320, courses: 48, completions: 41 },
  { month: "T4", hours: 1650, courses: 58, completions: 50 },
  { month: "T5", hours: 1890, courses: 65, completions: 56 },
  { month: "T6", hours: 2100, courses: 72, completions: 63 },
  { month: "T7", hours: 1750, courses: 60, completions: 52 },
  { month: "T8", hours: 2340, courses: 78, completions: 68 },
  { month: "T9", hours: 2560, courses: 85, completions: 74 },
  { month: "T10", hours: 2180, courses: 75, completions: 65 },
  { month: "T11", hours: 2890, courses: 92, completions: 82 },
  { month: "T12", hours: 3100, courses: 98, completions: 88 },
];

export const departmentCompletionData = [
  { name: "Ban GĐ", completion: 92, enrolled: 45 },
  { name: "Nhân sự", completion: 88, enrolled: 120 },
  { name: "TC-KT", completion: 85, enrolled: 180 },
  { name: "Kinh doanh", completion: 78, enrolled: 240 },
  { name: "Marketing", completion: 82, enrolled: 95 },
  { name: "IT", completion: 90, enrolled: 65 },
  { name: "Pháp chế", completion: 95, enrolled: 40 },
  { name: "Kỹ thuật", completion: 75, enrolled: 310 },
];

export const categoryDistribution = [
  { name: "Kỹ năng LĐ", value: 18, color: "#990803" },
  { name: "Chuyên môn", value: 25, color: "#c8a84e" },
  { name: "An toàn LĐ", value: 15, color: "#2e86de" },
  { name: "Tuân thủ", value: 12, color: "#27ae60" },
  { name: "Kỹ năng mềm", value: 20, color: "#e74c3c" },
  { name: "CNTT", value: 10, color: "#8e44ad" },
];

export const subsidiaryStats = [
  { name: "VP Tập đoàn", employees: 320, courses: 32, avgCompletion: 87 },
  { name: "ABBank", employees: 2850, courses: 58, avgCompletion: 82 },
  { name: "CK An Bình", employees: 180, courses: 22, avgCompletion: 80 },
  { name: "Bảo hiểm AAA", employees: 420, courses: 25, avgCompletion: 78 },
  { name: "Xi măng T.Long", employees: 680, courses: 30, avgCompletion: 91 },
  { name: "Khoáng sản", employees: 540, courses: 28, avgCompletion: 93 },
  { name: "NĐ Thăng Long", employees: 350, courses: 24, avgCompletion: 89 },
  { name: "NL Tái tạo", employees: 120, courses: 15, avgCompletion: 85 },
  { name: "BĐS Lê T.Tấn", employees: 280, courses: 20, avgCompletion: 76 },
  { name: "BĐS An Khánh", employees: 240, courses: 18, avgCompletion: 79 },
  { name: "BĐS Dương Nội", employees: 195, courses: 16, avgCompletion: 74 },
  { name: "KCN Q.Minh", employees: 150, courses: 14, avgCompletion: 83 },
  { name: "TM & XNK", employees: 200, courses: 17, avgCompletion: 81 },
  { name: "Giáo dục", employees: 85, courses: 12, avgCompletion: 90 },
];

// ============================================
// QUIZZES & ASSESSMENTS
// ============================================
export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  type: "quiz" | "exam" | "survey";
  questionCount: number;
  duration: number; // minutes
  passingScore: number;
  attempts: number;
  maxAttempts: number;
  bestScore: number | null;
  status: "not_started" | "in_progress" | "passed" | "failed";
  dueDate: string;
  category: string;
}

export const mockQuizzes: Quiz[] = [
  { id: "Q001", title: "Kiểm tra: Khung năng lực lãnh đạo", courseId: "C001", courseName: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung", type: "quiz", questionCount: 20, duration: 30, passingScore: 70, attempts: 1, maxAttempts: 3, bestScore: 85, status: "passed", dueDate: "2026-03-15", category: "Kỹ năng lãnh đạo" },
  { id: "Q002", title: "Thi cuối khóa: An toàn Lao động", courseId: "C002", courseName: "An toàn Lao động trong Xây dựng & Khai khoáng", type: "exam", questionCount: 40, duration: 60, passingScore: 80, attempts: 0, maxAttempts: 2, bestScore: null, status: "not_started", dueDate: "2026-03-20", category: "An toàn lao động" },
  { id: "Q003", title: "Bài kiểm tra: Phân tích dòng tiền", courseId: "C003", courseName: "Phân tích Tài chính Doanh nghiệp", type: "quiz", questionCount: 15, duration: 25, passingScore: 65, attempts: 2, maxAttempts: 3, bestScore: 60, status: "failed", dueDate: "2026-03-10", category: "Tài chính & Kế toán" },
  { id: "Q004", title: "Đánh giá: Chiến lược Digital Marketing", courseId: "C004", courseName: "Marketing số & Truyền thông Thương hiệu", type: "quiz", questionCount: 25, duration: 35, passingScore: 70, attempts: 1, maxAttempts: 3, bestScore: 92, status: "passed", dueDate: "2026-04-01", category: "Marketing & Truyền thông" },
  { id: "Q005", title: "Thi chứng chỉ PMP Mock Exam", courseId: "C005", courseName: "Quản lý Dự án theo chuẩn PMI", type: "exam", questionCount: 50, duration: 90, passingScore: 75, attempts: 0, maxAttempts: 2, bestScore: null, status: "not_started", dueDate: "2026-04-15", category: "Quản lý dự án" },
  { id: "Q006", title: "Khảo sát: Trải nghiệm Onboarding", courseId: "C006", courseName: "Onboarding - Chào mừng Thành viên mới", type: "survey", questionCount: 10, duration: 15, passingScore: 0, attempts: 1, maxAttempts: 1, bestScore: 100, status: "passed", dueDate: "2026-02-28", category: "Onboarding" },
  { id: "Q007", title: "Thi cuối khóa: Tuân thủ Pháp luật", courseId: "C007", courseName: "Tuân thủ Pháp luật Doanh nghiệp", type: "exam", questionCount: 30, duration: 45, passingScore: 80, attempts: 1, maxAttempts: 2, bestScore: 78, status: "failed", dueDate: "2026-03-25", category: "Tuân thủ & Pháp luật" },
  { id: "Q008", title: "Quiz: Kỹ năng giao tiếp hiệu quả", courseId: "C008", courseName: "Kỹ năng Teamwork & Giao tiếp Hiệu quả", type: "quiz", questionCount: 12, duration: 20, passingScore: 60, attempts: 0, maxAttempts: 3, bestScore: null, status: "in_progress", dueDate: "2026-03-30", category: "Kỹ năng mềm" },
];

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const sampleQuizQuestions: QuizQuestion[] = [
  { id: 1, question: "Đâu là yếu tố quan trọng nhất trong năng lực lãnh đạo?", options: ["Quyền lực vị trí", "Tầm nhìn chiến lược", "Kỹ năng kỹ thuật", "Kinh nghiệm làm việc"], correctAnswer: 1, explanation: "Tầm nhìn chiến lược giúp nhà lãnh đạo định hướng phát triển và truyền cảm hứng cho đội ngũ." },
  { id: 2, question: "Phong cách lãnh đạo nào phù hợp nhất khi đội nhóm có năng lực cao và động lực tốt?", options: ["Chỉ đạo (Directive)", "Ủy quyền (Delegating)", "Hỗ trợ (Supporting)", "Huấn luyện (Coaching)"], correctAnswer: 1, explanation: "Khi đội nhóm đã trưởng thành, phong cách ủy quyền giúp phát huy tối đa tiềm năng của từng cá nhân." },
  { id: 3, question: "Trong quản lý hiệu suất, KPI viết tắt của gì?", options: ["Key Performance Indicator", "Key Process Integration", "Knowledge Performance Index", "Key Planning Initiative"], correctAnswer: 0, explanation: "KPI - Key Performance Indicator là chỉ số đo lường hiệu suất chính yếu." },
  { id: 4, question: "Mô hình SWOT phân tích những yếu tố nào?", options: ["Speed, Width, Output, Time", "Strengths, Weaknesses, Opportunities, Threats", "Strategy, Work, Objectives, Targets", "System, Workflow, Operations, Technology"], correctAnswer: 1, explanation: "SWOT là công cụ phân tích chiến lược bao gồm Điểm mạnh, Điểm yếu, Cơ hội và Thách thức." },
  { id: 5, question: "Nguyên tắc 80/20 (Pareto) trong quản lý có nghĩa là gì?", options: ["80% công việc cần 20% thời gian", "80% kết quả đến từ 20% nỗ lực", "80% nhân viên tạo ra 20% lợi nhuận", "80% dự án hoàn thành trong 20% ngân sách"], correctAnswer: 1, explanation: "Nguyên tắc Pareto cho rằng 80% kết quả đến từ 20% nguyên nhân quan trọng nhất." },
];

// ============================================
// FORUM / DISCUSSIONS
// ============================================
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  courseId: string | null;
  courseName: string | null;
  category: "question" | "discussion" | "announcement" | "resource";
  tags: string[];
  replies: number;
  views: number;
  likes: number;
  isPinned: boolean;
  isResolved: boolean;
  createdAt: string;
  lastReplyAt: string;
}

export const mockForumPosts: ForumPost[] = [
  { id: "F001", title: "Cách áp dụng mô hình DISC trong quản lý đội nhóm?", content: "Mình vừa học xong phần DISC trong khóa Lãnh đạo, muốn hỏi kinh nghiệm áp dụng thực tế tại các phòng ban...", author: "Trần Thị Hương", authorRole: "Trưởng phòng Nhân sự", authorAvatar: "", courseId: "C001", courseName: "Kỹ năng Lãnh đạo", category: "question", tags: ["DISC", "Leadership", "Team"], replies: 12, views: 245, likes: 18, isPinned: true, isResolved: true, createdAt: "2026-03-05", lastReplyAt: "2026-03-08" },
  { id: "F002", title: "Tài liệu bổ sung: Bộ quy tắc an toàn mới 2026", content: "Chia sẻ bộ tài liệu cập nhật quy tắc an toàn lao động mới nhất từ Bộ LĐTBXH...", author: "KS. Trần Minh Đức", authorRole: "Giảng viên An toàn", authorAvatar: "", courseId: "C002", courseName: "An toàn Lao động", category: "resource", tags: ["Safety", "Compliance", "Update"], replies: 8, views: 520, likes: 35, isPinned: true, isResolved: false, createdAt: "2026-03-03", lastReplyAt: "2026-03-09" },
  { id: "F003", title: "Khó khăn khi phân tích dòng tiền tự do (FCF)", content: "Bài tập phân tích FCF trong khóa Tài chính khá khó, ai có thể giải thích kỹ hơn không?", author: "Lê Hoàng Nam", authorRole: "Chuyên viên Tài chính", authorAvatar: "", courseId: "C003", courseName: "Phân tích Tài chính", category: "question", tags: ["Finance", "FCF", "Help"], replies: 6, views: 89, likes: 4, isPinned: false, isResolved: false, createdAt: "2026-03-07", lastReplyAt: "2026-03-09" },
  { id: "F004", title: "Thảo luận: Xu hướng Marketing 2026 cho BĐS", content: "Các anh chị cùng thảo luận về xu hướng digital marketing cho lĩnh vực BĐS năm 2026...", author: "Phạm Anh Tuấn", authorRole: "Trưởng nhóm Marketing", authorAvatar: "", courseId: "C004", courseName: "Marketing số", category: "discussion", tags: ["Marketing", "BĐS", "Trends"], replies: 23, views: 412, likes: 28, isPinned: false, isResolved: false, createdAt: "2026-03-01", lastReplyAt: "2026-03-09" },
  { id: "F005", title: "Thông báo: Lịch thi chứng chỉ PMP tháng 4/2026", content: "Thông báo đến các anh chị đang theo học khóa QLDA: lịch thi PMP mock exam sẽ tổ chức ngày 15/04...", author: "Nguyễn Văn Minh", authorRole: "Giám đốc Đào tạo", authorAvatar: "", courseId: "C005", courseName: "Quản lý Dự án PMI", category: "announcement", tags: ["PMP", "Exam", "Schedule"], replies: 5, views: 180, likes: 12, isPinned: true, isResolved: false, createdAt: "2026-03-06", lastReplyAt: "2026-03-08" },
  { id: "F006", title: "Kinh nghiệm vượt qua bài thi Tuân thủ Pháp luật", content: "Chia sẻ kinh nghiệm ôn thi và các tips để đạt điểm cao trong kỳ thi cuối khóa...", author: "Hoàng Thị Lan", authorRole: "Trưởng Ban Pháp chế", authorAvatar: "", courseId: "C007", courseName: "Tuân thủ Pháp luật", category: "discussion", tags: ["Legal", "Tips", "Exam"], replies: 15, views: 320, likes: 22, isPinned: false, isResolved: false, createdAt: "2026-02-28", lastReplyAt: "2026-03-07" },
  { id: "F007", title: "Hỏi đáp: Chương trình onboarding cho nhân viên IT", content: "Team IT mới có 5 thành viên mới, nên customize chương trình onboarding như thế nào?", author: "Đỗ Minh Châu", authorRole: "Giám đốc CNTT", authorAvatar: "", courseId: null, courseName: null, category: "question", tags: ["Onboarding", "IT", "Customize"], replies: 9, views: 156, likes: 7, isPinned: false, isResolved: true, createdAt: "2026-03-04", lastReplyAt: "2026-03-06" },
  { id: "F008", title: "Best practices: Áp dụng Agile trong quản lý BĐS", content: "Chia sẻ case study thực tế khi áp dụng Agile/Scrum cho dự án BĐS tại Lê Trọng Tấn...", author: "Ngô Thị Mai", authorRole: "Trưởng phòng Kinh doanh", authorAvatar: "", courseId: "C005", courseName: "Quản lý Dự án PMI", category: "resource", tags: ["Agile", "BĐS", "Case Study"], replies: 18, views: 278, likes: 31, isPinned: false, isResolved: false, createdAt: "2026-02-25", lastReplyAt: "2026-03-05" },
];

// ============================================
// CALENDAR / TRAINING EVENTS
// ============================================
export interface TrainingEvent {
  id: string;
  title: string;
  description: string;
  courseId: string | null;
  type: "class" | "exam" | "workshop" | "webinar" | "deadline";
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
  maxParticipants: number;
  currentParticipants: number;
  subsidiary: string;
  color: string;
}

export const mockTrainingEvents: TrainingEvent[] = [
  { id: "EV001", title: "Lớp Lãnh đạo Cấp trung - Buổi 5", description: "Giao tiếp lãnh đạo & Phản hồi hiệu quả", courseId: "C001", type: "class", startDate: "2026-03-09", endDate: "2026-03-09", startTime: "09:00", endTime: "11:30", location: "Phòng đào tạo A1 - Tầng 8, Tòa nhà Geleximco", instructor: "TS. Nguyễn Văn Hùng", maxParticipants: 30, currentParticipants: 24, subsidiary: "Tập đoàn Geleximco", color: "#990803" },
  { id: "EV002", title: "Workshop: An toàn Lao động thực hành", description: "Thực hành sử dụng thiết bị bảo hộ và xử lý tình huống khẩn cấp", courseId: "C002", type: "workshop", startDate: "2026-03-10", endDate: "2026-03-10", startTime: "08:00", endTime: "17:00", location: "Công trường Khoáng sản Geleximco - Quảng Ninh", instructor: "KS. Trần Minh Đức", maxParticipants: 50, currentParticipants: 48, subsidiary: "Khoáng sản Geleximco", color: "#e74c3c" },
  { id: "EV003", title: "Webinar: Phân tích Báo cáo Tài chính Q1/2026", description: "Hướng dẫn phân tích báo cáo tài chính quý 1 năm 2026", courseId: "C003", type: "webinar", startDate: "2026-03-11", endDate: "2026-03-11", startTime: "14:00", endTime: "16:00", location: "Online - Microsoft Teams", instructor: "ThS. Lê Thị Thu Hà", maxParticipants: 200, currentParticipants: 145, subsidiary: "ABBank", color: "#2e86de" },
  { id: "EV004", title: "Thi cuối khóa: Tuân thủ Pháp luật DN", description: "Kỳ thi bắt buộc cho toàn bộ nhân sự", courseId: "C007", type: "exam", startDate: "2026-03-12", endDate: "2026-03-12", startTime: "09:00", endTime: "10:30", location: "Online - Hệ thống LMS", instructor: "LS. Nguyễn Thị Lan", maxParticipants: 500, currentParticipants: 420, subsidiary: "Tập đoàn Geleximco", color: "#f39c12" },
  { id: "EV005", title: "Lớp Marketing số - Buổi 8", description: "Content Marketing & SEO cho BĐS", courseId: "C004", type: "class", startDate: "2026-03-13", endDate: "2026-03-13", startTime: "13:30", endTime: "16:00", location: "Phòng đào tạo B2 - VP BĐS An Khánh", instructor: "ThS. Phạm Anh Tuấn", maxParticipants: 25, currentParticipants: 22, subsidiary: "BĐS An Khánh", color: "#c8a84e" },
  { id: "EV006", title: "Deadline: Hoàn thành khóa Onboarding", description: "Hạn chót hoàn thành cho nhân viên mới tháng 2", courseId: "C006", type: "deadline", startDate: "2026-03-14", endDate: "2026-03-14", startTime: "23:59", endTime: "23:59", location: "Online - Hệ thống LMS", instructor: "HR Team", maxParticipants: 0, currentParticipants: 0, subsidiary: "Tập đoàn Geleximco", color: "#e74c3c" },
  { id: "EV007", title: "Workshop: Agile & Scrum trong QLDA BĐS", description: "Thực hành Sprint Planning và Daily Standup", courseId: "C005", type: "workshop", startDate: "2026-03-15", endDate: "2026-03-16", startTime: "09:00", endTime: "17:00", location: "Trung tâm Đào tạo Geleximco - Hà Nội", instructor: "PMP. Hoàng Đình Nam", maxParticipants: 35, currentParticipants: 28, subsidiary: "BĐS Lê Trọng Tấn", color: "#27ae60" },
  { id: "EV008", title: "Webinar: Kỹ năng Teamwork cho Remote Team", description: "Giao tiếp hiệu quả và xây dựng đội nhóm từ xa", courseId: "C008", type: "webinar", startDate: "2026-03-17", endDate: "2026-03-17", startTime: "10:00", endTime: "11:30", location: "Online - Zoom", instructor: "ThS. Vũ Minh Châu", maxParticipants: 150, currentParticipants: 98, subsidiary: "Tập đoàn Geleximco", color: "#8e44ad" },
  { id: "EV009", title: "Lớp Lãnh đạo Cấp trung - Buổi 6", description: "Quản lý hiệu suất đội nhóm", courseId: "C001", type: "class", startDate: "2026-03-19", endDate: "2026-03-19", startTime: "09:00", endTime: "11:30", location: "Phòng đào tạo A1 - Tầng 8", instructor: "TS. Nguyễn Văn Hùng", maxParticipants: 30, currentParticipants: 24, subsidiary: "Tập đoàn Geleximco", color: "#990803" },
  { id: "EV010", title: "Thi PMP Mock Exam", description: "Thi thử chứng chỉ PMP cho khóa QLDA", courseId: "C005", type: "exam", startDate: "2026-03-22", endDate: "2026-03-22", startTime: "08:30", endTime: "11:30", location: "Phòng thi C1 - Tầng 5", instructor: "PMP. Hoàng Đình Nam", maxParticipants: 40, currentParticipants: 32, subsidiary: "BĐS Lê Trọng Tấn", color: "#f39c12" },
];

// ============================================
// ANNOUNCEMENTS
// ============================================
export interface Announcement {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  authorRole: string;
  priority: "high" | "medium" | "low";
  category: "policy" | "event" | "update" | "achievement" | "maintenance";
  targetAudience: string;
  publishDate: string;
  expiryDate: string;
  isPinned: boolean;
  isRead: boolean;
  attachments: number;
  readCount: number;
}

export const mockAnnouncements: Announcement[] = [
  { id: "A001", title: "Chính sách Đào tạo Bắt buộc Năm 2026", content: "Kính gửi toàn thể CBNV Tập đoàn Geleximco,\n\nTheo quyết định của Ban Giám đốc, tất cả nhân sự phải hoàn thành tối thiểu 40 giờ đào tạo/năm, bao gồm:\n- 16 giờ đào tạo bắt buộc (An toàn LĐ + Tuân thủ PL)\n- 24 giờ đào tạo chuyên môn/kỹ năng\n\nThời hạn hoàn thành: 31/12/2026\nHệ thống LMS sẽ tự động theo dõi và báo cáo tiến độ hàng tháng.", summary: "Mọi CBNV cần hoàn thành tối thiểu 40 giờ đào tạo trong năm 2026", author: "Nguyễn Văn Minh", authorRole: "Giám đốc Đào tạo", priority: "high", category: "policy", targetAudience: "Toàn tập đoàn", publishDate: "2026-01-05", expiryDate: "2026-12-31", isPinned: true, isRead: false, attachments: 2, readCount: 2450 },
  { id: "A002", title: "Workshop An toàn Lao động tại Quảng Ninh", content: "Thông báo tổ chức workshop thực hành an toàn lao động tại công trường Khoáng sản Geleximco - Quảng Ninh.\n\nThời gian: 10/03/2026, 08:00 - 17:00\nĐịa điểm: Công trường Khoáng sản GEL - Quảng Ninh\nĐối tượng: Toàn bộ nhân sự khối khai khoáng & xây dựng\n\nĐăng ký qua LMS trước ngày 08/03/2026.", summary: "Workshop thực hành an toàn lao động tại Quảng Ninh ngày 10/03", author: "KS. Trần Minh Đức", authorRole: "Trưởng ban An toàn", priority: "high", category: "event", targetAudience: "Khoáng sản Geleximco", publishDate: "2026-02-25", expiryDate: "2026-03-10", isPinned: true, isRead: true, attachments: 1, readCount: 380 },
  { id: "A003", title: "Nâng cấp Hệ thống LMS - Phiên bản 3.0", content: "Hệ thống LMS sẽ được nâng cấp lên phiên bản 3.0 với các tính năng mới:\n- Diễn đàn thảo luận cho từng khóa học\n- Lịch đào tạo tích hợp\n- Hệ thống kiểm tra trực tuyến cải tiến\n- Mobile app (sắp ra mắt)\n\nThời gian bảo trì: 01/03/2026, 22:00 - 02/03/2026, 06:00\nVui lòng hoàn thành các bài thi trước thời gian bảo trì.", summary: "LMS nâng cấp v3.0 với nhiều tính năng mới, bảo trì đêm 01/03", author: "Đỗ Minh Châu", authorRole: "Giám đốc CNTT", priority: "medium", category: "maintenance", targetAudience: "Toàn tập đoàn", publishDate: "2026-02-26", expiryDate: "2026-03-15", isPinned: false, isRead: true, attachments: 0, readCount: 1890 },
  { id: "A004", title: "Top 10 Học viên Xuất sắc Quý 1/2026", content: "Ban Đào tạo xin chúc mừng 10 học viên xuất sắc nhất Quý 1/2026:\n\n1. Hoàng Thị Lan - 45 giờ, 15 chứng chỉ\n2. Nguyễn Văn Minh - 42 giờ, 12 chứng chỉ\n3. Trần Thị Hương - 38 giờ, 10 chứng chỉ\n...\n\nGiải thưởng sẽ được trao tại buổi Town Hall tháng 4/2026.", summary: "Vinh danh top 10 học viên xuất sắc nhất quý 1 năm 2026", author: "Nguyễn Văn Minh", authorRole: "Giám đốc Đào tạo", priority: "low", category: "achievement", targetAudience: "Toàn tập đoàn", publishDate: "2026-03-01", expiryDate: "2026-04-30", isPinned: false, isRead: false, attachments: 1, readCount: 1560 },
  { id: "A005", title: "Cập nhật: Quy trình đánh giá năng lực 2026", content: "Phòng Nhân sự thông báo quy trình đánh giá năng lực mới cho năm 2026, tích hợp kết quả đào tạo từ LMS vào đánh giá KPI cá nhân.\n\nĐiểm đào tạo sẽ chiếm 15% tổng đánh giá năng lực cuối năm.\nChi tiết tại file đính kèm.", summary: "Kết quả đào tạo LMS sẽ tích hợp vào đánh giá KPI năm 2026", author: "Trần Thị Hương", authorRole: "Trưởng phòng Nhân sự", priority: "medium", category: "update", targetAudience: "Toàn tập đoàn", publishDate: "2026-02-20", expiryDate: "2026-12-31", isPinned: false, isRead: true, attachments: 3, readCount: 2100 },
  { id: "A006", title: "Mở đăng ký: Khóa AI trong Quản trị Doanh nghiệp", content: "Tập đoàn phối hợp với FPT Education mở khóa đào tạo mới:\n\"AI trong Quản trị Doanh nghiệp\"\n\nThời lượng: 20 giờ\nHình thức: Hybrid (online + offline)\nĐối tượng: Quản lý cấp trung trở lên\nSố lượng: 50 học viên\n\nĐăng ký ngay trên LMS!", summary: "Khóa mới AI trong Quản trị DN - đăng ký ngay, chỉ 50 suất", author: "Nguyễn Văn Minh", authorRole: "Giám đốc Đào tạo", priority: "medium", category: "event", targetAudience: "Quản lý cấp trung+", publishDate: "2026-03-05", expiryDate: "2026-03-31", isPinned: true, isRead: false, attachments: 1, readCount: 890 },
];