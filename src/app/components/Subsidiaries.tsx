import { useState, useRef, useEffect, useMemo } from "react";
import {
  Building2, Users, BookOpen, TrendingUp, Search, MapPin, X,
  Award, Clock, Target, ChevronRight, Eye, BarChart3,
  GraduationCap, CheckCircle2, AlertTriangle, Layers,
  ArrowUpDown, Grid3X3, List, Star, Calendar, Zap,
  Trophy, Filter, ArrowUp, ArrowDown, Percent, Route as RouteIcon,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { BUSINESS_SECTORS, mockCourses, CATEGORIES } from "./mock-data";

// ============================================
// SUBSIDIARY TRAINING DATA - LMS-focused
// ============================================
interface SubsidiaryTraining {
  id: string;
  name: string;
  shortName: string;
  sector: string;
  location: string;
  employees: number;
  // Training metrics
  totalCourses: number;
  activeCourses: number;
  mandatoryCourses: number;
  completionRate: number;
  avgScore: number;
  activelearners: number;
  certificatesIssued: number;
  totalLearningHours: number;
  avgHoursPerEmployee: number;
  learningPaths: number;
  overdueTraining: number;
  // Monthly trend (last 6 months)
  monthlyTrend: { month: string; completions: number; enrollments: number; hours: number }[];
  // Top categories
  topCategories: { name: string; courses: number; completion: number }[];
  // Top performers (departments)
  topDepartments: { name: string; completion: number; avgScore: number; activeRate: number }[];
  // Recent activity
  recentActivity: { action: string; detail: string; time: string }[];
  // Training budget utilization
  budgetUtilization: number;
  complianceRate: number;
  npsScore: number;
}

const subsidiaryData: SubsidiaryTraining[] = [
  {
    id: "S01", name: "Tập đoàn Geleximco", shortName: "VP Tập đoàn", sector: "holding", location: "36 Hoàng Cầu, Đống Đa, Hà Nội", employees: 320,
    totalCourses: 32, activeCourses: 28, mandatoryCourses: 12, completionRate: 87, avgScore: 8.2, activelearners: 295, certificatesIssued: 1240, totalLearningHours: 15680, avgHoursPerEmployee: 49, learningPaths: 8, overdueTraining: 12, budgetUtilization: 92, complianceRate: 96, npsScore: 4.5,
    monthlyTrend: [
      { month: "T10", completions: 85, enrollments: 120, hours: 2400 },
      { month: "T11", completions: 92, enrollments: 105, hours: 2650 },
      { month: "T12", completions: 78, enrollments: 95, hours: 2200 },
      { month: "T01", completions: 110, enrollments: 140, hours: 3100 },
      { month: "T02", completions: 95, enrollments: 115, hours: 2800 },
      { month: "T03", completions: 105, enrollments: 130, hours: 2930 },
    ],
    topCategories: [
      { name: "Kỹ năng Lãnh đạo & Quản trị", courses: 6, completion: 92 },
      { name: "Tuân thủ Pháp luật", courses: 4, completion: 95 },
      { name: "Onboarding & Văn hóa", courses: 3, completion: 98 },
      { name: "CNTT & Chuyển đổi số", courses: 5, completion: 82 },
    ],
    topDepartments: [
      { name: "Ban Giám đốc Tập đoàn", completion: 97, avgScore: 9.1, activeRate: 100 },
      { name: "Ban Nhân sự Tập đoàn", completion: 94, avgScore: 8.8, activeRate: 98 },
      { name: "Ban Tài chính Tập đoàn", completion: 90, avgScore: 8.5, activeRate: 95 },
      { name: "Ban CNTT & Chuyển đổi số", completion: 88, avgScore: 8.3, activeRate: 92 },
    ],
    recentActivity: [
      { action: "Hoàn thành khóa", detail: "32 nhân sự hoàn thành \"Tuân thủ Pháp luật DN 2026\"", time: "2 giờ trước" },
      { action: "Mở khóa mới", detail: "Khóa \"ESG & Phát triển Bền vững\" bắt đầu tuyển sinh", time: "1 ngày trước" },
      { action: "Cấp chứng chỉ", detail: "15 chứng chỉ Quản lý Cấp trung được cấp", time: "2 ngày trước" },
    ],
  },
  {
    id: "S02", name: "Ngân hàng TMCP An Bình (ABBank)", shortName: "ABBank", sector: "finance", location: "170 Hai Bà Trưng, Q1, TP.HCM", employees: 2850,
    totalCourses: 58, activeCourses: 52, mandatoryCourses: 18, completionRate: 82, avgScore: 7.9, activelearners: 2520, certificatesIssued: 8450, totalLearningHours: 125400, avgHoursPerEmployee: 44, learningPaths: 15, overdueTraining: 85, budgetUtilization: 88, complianceRate: 94, npsScore: 4.3,
    monthlyTrend: [
      { month: "T10", completions: 520, enrollments: 680, hours: 18500 },
      { month: "T11", completions: 580, enrollments: 720, hours: 20100 },
      { month: "T12", completions: 490, enrollments: 600, hours: 17200 },
      { month: "T01", completions: 650, enrollments: 800, hours: 22400 },
      { month: "T02", completions: 610, enrollments: 750, hours: 21000 },
      { month: "T03", completions: 640, enrollments: 780, hours: 21800 },
    ],
    topCategories: [
      { name: "Nghiệp vụ Ngân hàng & Tín dụng", courses: 14, completion: 88 },
      { name: "Quản trị Rủi ro", courses: 8, completion: 85 },
      { name: "Tài chính & Kế toán DN", courses: 6, completion: 82 },
      { name: "Kỹ năng mềm & Phát triển CN", courses: 10, completion: 78 },
    ],
    topDepartments: [
      { name: "Khối Quản trị Rủi ro", completion: 92, avgScore: 8.6, activeRate: 97 },
      { name: "Khối Ngân hàng Bán lẻ", completion: 86, avgScore: 8.1, activeRate: 90 },
      { name: "Khối Tín dụng", completion: 84, avgScore: 7.9, activeRate: 88 },
      { name: "Khối Giao dịch & DV KH", completion: 80, avgScore: 7.7, activeRate: 85 },
    ],
    recentActivity: [
      { action: "Đào tạo bắt buộc", detail: "Chống rửa tiền AML 2026 - 1,200 nhân sự đăng ký", time: "3 giờ trước" },
      { action: "Thi sát hạch", detail: "Kỳ thi Nghiệp vụ Tín dụng Q1/2026 hoàn tất", time: "1 ngày trước" },
      { action: "Chứng chỉ hết hạn", detail: "45 chứng chỉ CFA sắp hết hạn trong 30 ngày", time: "2 ngày trước" },
    ],
  },
  {
    id: "S03", name: "Chứng khoán An Bình (ABS)", shortName: "CK An Bình", sector: "finance", location: "Tầng 5, 65 Nguyễn Du, HBT, HN", employees: 180,
    totalCourses: 22, activeCourses: 19, mandatoryCourses: 8, completionRate: 80, avgScore: 7.8, activelearners: 158, certificatesIssued: 520, totalLearningHours: 7200, avgHoursPerEmployee: 40, learningPaths: 5, overdueTraining: 8, budgetUtilization: 78, complianceRate: 91, npsScore: 4.1,
    monthlyTrend: [
      { month: "T10", completions: 38, enrollments: 52, hours: 1080 },
      { month: "T11", completions: 42, enrollments: 55, hours: 1200 },
      { month: "T12", completions: 35, enrollments: 48, hours: 1000 },
      { month: "T01", completions: 50, enrollments: 65, hours: 1400 },
      { month: "T02", completions: 45, enrollments: 58, hours: 1250 },
      { month: "T03", completions: 48, enrollments: 62, hours: 1320 },
    ],
    topCategories: [
      { name: "Nghiệp vụ Chứng khoán", courses: 7, completion: 85 },
      { name: "Quản trị Rủi ro", courses: 4, completion: 82 },
      { name: "Tuân thủ Pháp luật", courses: 5, completion: 90 },
      { name: "Phân tích Tài chính", courses: 3, completion: 78 },
    ],
    topDepartments: [
      { name: "Phòng Phân tích", completion: 88, avgScore: 8.2, activeRate: 95 },
      { name: "Phòng Môi giới", completion: 82, avgScore: 7.8, activeRate: 90 },
      { name: "Phòng Tuân thủ", completion: 92, avgScore: 8.5, activeRate: 100 },
    ],
    recentActivity: [
      { action: "Cập nhật khóa", detail: "Khóa \"Luật Chứng khoán 2026\" được cập nhật nội dung", time: "5 giờ trước" },
      { action: "Hoàn thành khóa", detail: "15 nhân sự hoàn thành khóa CFA Level 1 Prep", time: "1 ngày trước" },
    ],
  },
  {
    id: "S04", name: "Bảo hiểm AAA", shortName: "Bảo hiểm AAA", sector: "finance", location: "Tầng 12, Lotte Center, Hà Nội", employees: 420,
    totalCourses: 25, activeCourses: 22, mandatoryCourses: 10, completionRate: 78, avgScore: 7.6, activelearners: 362, certificatesIssued: 980, totalLearningHours: 16800, avgHoursPerEmployee: 40, learningPaths: 6, overdueTraining: 18, budgetUtilization: 82, complianceRate: 89, npsScore: 4.0,
    monthlyTrend: [
      { month: "T10", completions: 72, enrollments: 95, hours: 2500 },
      { month: "T11", completions: 80, enrollments: 100, hours: 2800 },
      { month: "T12", completions: 65, enrollments: 85, hours: 2300 },
      { month: "T01", completions: 90, enrollments: 115, hours: 3100 },
      { month: "T02", completions: 82, enrollments: 105, hours: 2900 },
      { month: "T03", completions: 88, enrollments: 110, hours: 2950 },
    ],
    topCategories: [
      { name: "Nghiệp vụ Bảo hiểm", courses: 8, completion: 82 },
      { name: "Kỹ năng Bán hàng", courses: 5, completion: 75 },
      { name: "Tuân thủ Pháp luật", courses: 4, completion: 88 },
      { name: "Dịch vụ Khách hàng", courses: 4, completion: 80 },
    ],
    topDepartments: [
      { name: "Phòng Giám định", completion: 86, avgScore: 8.0, activeRate: 92 },
      { name: "Phòng Khai thác", completion: 78, avgScore: 7.5, activeRate: 85 },
      { name: "Phòng Bồi thường", completion: 82, avgScore: 7.8, activeRate: 88 },
    ],
    recentActivity: [
      { action: "Đào tạo bắt buộc", detail: "Khóa PCCC & An toàn 2026 triển khai cho toàn bộ", time: "6 giờ trước" },
      { action: "Cấp chứng chỉ", detail: "22 chứng chỉ Đại lý Bảo hiểm được cấp mới", time: "2 ngày trước" },
    ],
  },
  {
    id: "S05", name: "Xi măng Thăng Long", shortName: "Xi măng T.Long", sector: "materials", location: "Quảng Yên, Quảng Ninh", employees: 680,
    totalCourses: 30, activeCourses: 26, mandatoryCourses: 14, completionRate: 91, avgScore: 8.4, activelearners: 640, certificatesIssued: 2100, totalLearningHours: 34000, avgHoursPerEmployee: 50, learningPaths: 7, overdueTraining: 5, budgetUtilization: 95, complianceRate: 98, npsScore: 4.6,
    monthlyTrend: [
      { month: "T10", completions: 110, enrollments: 140, hours: 5200 },
      { month: "T11", completions: 125, enrollments: 150, hours: 5800 },
      { month: "T12", completions: 100, enrollments: 120, hours: 4800 },
      { month: "T01", completions: 140, enrollments: 170, hours: 6400 },
      { month: "T02", completions: 130, enrollments: 155, hours: 5900 },
      { month: "T03", completions: 135, enrollments: 160, hours: 6100 },
    ],
    topCategories: [
      { name: "Kỹ thuật Xi măng & VLXD", courses: 8, completion: 94 },
      { name: "An toàn Lao động (ATVSLĐ)", courses: 6, completion: 97 },
      { name: "Quản lý Chất lượng ISO", courses: 4, completion: 92 },
      { name: "Vận hành Thiết bị Công nghiệp", courses: 5, completion: 88 },
    ],
    topDepartments: [
      { name: "Phân xưởng Sản xuất", completion: 94, avgScore: 8.7, activeRate: 98 },
      { name: "Ban Kỹ thuật - Vận hành", completion: 92, avgScore: 8.5, activeRate: 96 },
      { name: "Ban Quản lý Chất lượng", completion: 96, avgScore: 8.9, activeRate: 100 },
      { name: "Ban An toàn Lao động", completion: 98, avgScore: 9.0, activeRate: 100 },
    ],
    recentActivity: [
      { action: "Thi sát hạch", detail: "Kỳ thi ATVSLĐ định kỳ Q1/2026 - 680 nhân sự", time: "4 giờ trước" },
      { action: "Cấp chứng chỉ", detail: "45 chứng chỉ Vận hành Lò nung được gia hạn", time: "1 ngày trước" },
      { action: "Hoàn thành LP", detail: "Lộ trình \"Kỹ sư Xi măng\" - 28 nhân sự hoàn thành", time: "3 ngày trước" },
    ],
  },
  {
    id: "S06", name: "Khoáng sản Geleximco", shortName: "Khoáng sản GX", sector: "mining", location: "Cẩm Phả, Quảng Ninh", employees: 540,
    totalCourses: 28, activeCourses: 24, mandatoryCourses: 16, completionRate: 93, avgScore: 8.5, activelearners: 520, certificatesIssued: 1850, totalLearningHours: 28350, avgHoursPerEmployee: 52.5, learningPaths: 6, overdueTraining: 3, budgetUtilization: 96, complianceRate: 99, npsScore: 4.7,
    monthlyTrend: [
      { month: "T10", completions: 95, enrollments: 115, hours: 4300 },
      { month: "T11", completions: 105, enrollments: 125, hours: 4800 },
      { month: "T12", completions: 88, enrollments: 108, hours: 4100 },
      { month: "T01", completions: 120, enrollments: 145, hours: 5500 },
      { month: "T02", completions: 110, enrollments: 130, hours: 5000 },
      { month: "T03", completions: 115, enrollments: 138, hours: 5200 },
    ],
    topCategories: [
      { name: "An toàn Mỏ & Khai khoáng", courses: 8, completion: 98 },
      { name: "Địa chất & Thăm dò", courses: 4, completion: 90 },
      { name: "Vận hành Thiết bị Mỏ", courses: 6, completion: 92 },
      { name: "Bảo vệ Môi trường", courses: 3, completion: 88 },
    ],
    topDepartments: [
      { name: "Ban An toàn Mỏ & LĐ", completion: 99, avgScore: 9.2, activeRate: 100 },
      { name: "Ban Địa chất & Thăm dò", completion: 93, avgScore: 8.6, activeRate: 98 },
      { name: "Phân xưởng Sản xuất", completion: 92, avgScore: 8.4, activeRate: 96 },
    ],
    recentActivity: [
      { action: "Đào tạo an toàn", detail: "Diễn tập Sơ cứu Tai nạn Mỏ - 540 nhân sự tham gia", time: "1 giờ trước" },
      { action: "Kiểm tra định kỳ", detail: "Thi An toàn Mỏ hàng quý - 98% đạt yêu cầu", time: "2 ngày trước" },
    ],
  },
  {
    id: "S07", name: "Nhiệt điện Thăng Long", shortName: "NĐ Thăng Long", sector: "energy", location: "Quảng Yên, Quảng Ninh", employees: 350,
    totalCourses: 24, activeCourses: 21, mandatoryCourses: 12, completionRate: 89, avgScore: 8.3, activelearners: 330, certificatesIssued: 1120, totalLearningHours: 17500, avgHoursPerEmployee: 50, learningPaths: 5, overdueTraining: 6, budgetUtilization: 90, complianceRate: 97, npsScore: 4.4,
    monthlyTrend: [
      { month: "T10", completions: 62, enrollments: 78, hours: 2700 },
      { month: "T11", completions: 70, enrollments: 85, hours: 2950 },
      { month: "T12", completions: 55, enrollments: 70, hours: 2400 },
      { month: "T01", completions: 80, enrollments: 100, hours: 3300 },
      { month: "T02", completions: 72, enrollments: 90, hours: 3000 },
      { month: "T03", completions: 78, enrollments: 95, hours: 3150 },
    ],
    topCategories: [
      { name: "Vận hành Nhà máy Điện", courses: 7, completion: 94 },
      { name: "An toàn Điện Công nghiệp", courses: 5, completion: 96 },
      { name: "Bảo trì & Sửa chữa", courses: 4, completion: 88 },
      { name: "Môi trường & Khí thải", courses: 3, completion: 85 },
    ],
    topDepartments: [
      { name: "Ban Vận hành NM Điện", completion: 95, avgScore: 8.8, activeRate: 98 },
      { name: "Ban Kỹ thuật Điện", completion: 90, avgScore: 8.4, activeRate: 95 },
      { name: "Ban Bảo trì & Sửa chữa", completion: 88, avgScore: 8.2, activeRate: 92 },
    ],
    recentActivity: [
      { action: "Simulation", detail: "Mô phỏng Xử lý sự cố Tổ máy #2 - 120 kỹ sư", time: "8 giờ trước" },
      { action: "Cập nhật SOP", detail: "SOP Vận hành Lò hơi 2026 - đào tạo lại 200 NS", time: "3 ngày trước" },
    ],
  },
  {
    id: "S08", name: "Geleximco Năng lượng Tái tạo", shortName: "NL Tái tạo", sector: "energy", location: "Hướng Hóa, Quảng Trị", employees: 120,
    totalCourses: 15, activeCourses: 13, mandatoryCourses: 7, completionRate: 85, avgScore: 8.0, activelearners: 108, certificatesIssued: 340, totalLearningHours: 5400, avgHoursPerEmployee: 45, learningPaths: 4, overdueTraining: 4, budgetUtilization: 85, complianceRate: 93, npsScore: 4.2,
    monthlyTrend: [
      { month: "T10", completions: 22, enrollments: 30, hours: 820 },
      { month: "T11", completions: 25, enrollments: 33, hours: 900 },
      { month: "T12", completions: 20, enrollments: 28, hours: 750 },
      { month: "T01", completions: 30, enrollments: 38, hours: 1050 },
      { month: "T02", completions: 27, enrollments: 35, hours: 950 },
      { month: "T03", completions: 28, enrollments: 36, hours: 980 },
    ],
    topCategories: [
      { name: "Năng lượng Tái tạo & Môi trường", courses: 5, completion: 88 },
      { name: "An toàn Điện Gió/Mặt trời", courses: 4, completion: 92 },
      { name: "Vận hành Turbine", courses: 3, completion: 85 },
    ],
    topDepartments: [
      { name: "Đội Vận hành Điện gió", completion: 90, avgScore: 8.3, activeRate: 95 },
      { name: "Đội Kỹ thuật Solar", completion: 85, avgScore: 8.0, activeRate: 90 },
    ],
    recentActivity: [
      { action: "Khóa mới", detail: "\"Vận hành Turbine gió V164\" - 40 kỹ sư đăng ký", time: "1 ngày trước" },
    ],
  },
  {
    id: "S09", name: "BĐS Geleximco - KĐT Lê Trọng Tấn", shortName: "KĐT Lê T.Tấn", sector: "realestate", location: "Hà Đông, Hà Nội (272ha)", employees: 280,
    totalCourses: 20, activeCourses: 17, mandatoryCourses: 8, completionRate: 76, avgScore: 7.5, activelearners: 235, certificatesIssued: 650, totalLearningHours: 11200, avgHoursPerEmployee: 40, learningPaths: 5, overdueTraining: 15, budgetUtilization: 78, complianceRate: 88, npsScore: 3.9,
    monthlyTrend: [
      { month: "T10", completions: 42, enrollments: 58, hours: 1700 },
      { month: "T11", completions: 48, enrollments: 62, hours: 1900 },
      { month: "T12", completions: 38, enrollments: 52, hours: 1550 },
      { month: "T01", completions: 55, enrollments: 72, hours: 2100 },
      { month: "T02", completions: 50, enrollments: 65, hours: 1950 },
      { month: "T03", completions: 52, enrollments: 68, hours: 2000 },
    ],
    topCategories: [
      { name: "Quản lý Dự án BĐS & Hạ tầng", courses: 6, completion: 80 },
      { name: "Marketing BĐS", courses: 4, completion: 75 },
      { name: "Kỹ năng Bán hàng BĐS", courses: 4, completion: 72 },
      { name: "Pháp lý BĐS", courses: 3, completion: 82 },
    ],
    topDepartments: [
      { name: "Ban Quản lý Dự án BĐS", completion: 82, avgScore: 7.8, activeRate: 88 },
      { name: "Ban Kinh doanh BĐS", completion: 75, avgScore: 7.4, activeRate: 82 },
      { name: "Ban Quy hoạch & Thiết kế", completion: 80, avgScore: 7.7, activeRate: 85 },
    ],
    recentActivity: [
      { action: "Phân công đào tạo", detail: "Lộ trình \"Chuyên viên BĐS\" cho 45 nhân sự mới", time: "4 giờ trước" },
      { action: "Thi cuối khóa", detail: "Khóa Pháp lý BĐS 2026 - 65 NS tham gia thi", time: "2 ngày trước" },
    ],
  },
  {
    id: "S10", name: "BĐS Geleximco - KĐT An Khánh", shortName: "KĐT An Khánh", sector: "realestate", location: "Hoài Đức, Hà Nội", employees: 240,
    totalCourses: 18, activeCourses: 15, mandatoryCourses: 7, completionRate: 79, avgScore: 7.6, activelearners: 205, certificatesIssued: 580, totalLearningHours: 9600, avgHoursPerEmployee: 40, learningPaths: 4, overdueTraining: 10, budgetUtilization: 80, complianceRate: 90, npsScore: 4.0,
    monthlyTrend: [
      { month: "T10", completions: 38, enrollments: 50, hours: 1500 },
      { month: "T11", completions: 42, enrollments: 55, hours: 1650 },
      { month: "T12", completions: 35, enrollments: 45, hours: 1380 },
      { month: "T01", completions: 48, enrollments: 62, hours: 1850 },
      { month: "T02", completions: 44, enrollments: 58, hours: 1720 },
      { month: "T03", completions: 46, enrollments: 60, hours: 1780 },
    ],
    topCategories: [
      { name: "Quản lý Dự án BĐS", courses: 5, completion: 82 },
      { name: "Kỹ năng Bán hàng", courses: 4, completion: 78 },
      { name: "Marketing BĐS", courses: 3, completion: 76 },
    ],
    topDepartments: [
      { name: "Ban Kinh doanh BĐS", completion: 82, avgScore: 7.8, activeRate: 88 },
      { name: "Ban Marketing BĐS", completion: 80, avgScore: 7.6, activeRate: 85 },
    ],
    recentActivity: [
      { action: "Onboarding", detail: "12 nhân sự mới hoàn thành chương trình hội nhập", time: "6 giờ trước" },
    ],
  },
  {
    id: "S11", name: "BĐS Geleximco - KĐT Dương Nội", shortName: "KĐT Dương Nội", sector: "realestate", location: "Hà Đông, Hà Nội", employees: 195,
    totalCourses: 16, activeCourses: 13, mandatoryCourses: 6, completionRate: 74, avgScore: 7.3, activelearners: 162, certificatesIssued: 420, totalLearningHours: 7410, avgHoursPerEmployee: 38, learningPaths: 3, overdueTraining: 12, budgetUtilization: 75, complianceRate: 86, npsScore: 3.8,
    monthlyTrend: [
      { month: "T10", completions: 30, enrollments: 42, hours: 1150 },
      { month: "T11", completions: 34, enrollments: 46, hours: 1280 },
      { month: "T12", completions: 28, enrollments: 38, hours: 1050 },
      { month: "T01", completions: 40, enrollments: 52, hours: 1450 },
      { month: "T02", completions: 36, enrollments: 48, hours: 1320 },
      { month: "T03", completions: 38, enrollments: 50, hours: 1380 },
    ],
    topCategories: [
      { name: "Quản lý Dự án BĐS", courses: 4, completion: 78 },
      { name: "Kỹ năng Bán hàng", courses: 4, completion: 72 },
      { name: "Onboarding", courses: 2, completion: 90 },
    ],
    topDepartments: [
      { name: "Ban Quản lý Dự án", completion: 78, avgScore: 7.5, activeRate: 85 },
      { name: "Ban Kinh doanh", completion: 72, avgScore: 7.2, activeRate: 80 },
    ],
    recentActivity: [
      { action: "Nhắc nhở", detail: "12 nhân sự quá hạn khóa An toàn Lao động", time: "2 giờ trước" },
    ],
  },
  {
    id: "S12", name: "KCN Quang Minh", shortName: "KCN Quang Minh", sector: "infrastructure", location: "Mê Linh, Hà Nội", employees: 150,
    totalCourses: 14, activeCourses: 12, mandatoryCourses: 6, completionRate: 83, avgScore: 7.9, activelearners: 135, certificatesIssued: 450, totalLearningHours: 6750, avgHoursPerEmployee: 45, learningPaths: 3, overdueTraining: 5, budgetUtilization: 82, complianceRate: 92, npsScore: 4.1,
    monthlyTrend: [
      { month: "T10", completions: 25, enrollments: 34, hours: 1050 },
      { month: "T11", completions: 28, enrollments: 36, hours: 1150 },
      { month: "T12", completions: 22, enrollments: 30, hours: 950 },
      { month: "T01", completions: 32, enrollments: 42, hours: 1300 },
      { month: "T02", completions: 30, enrollments: 38, hours: 1200 },
      { month: "T03", completions: 31, enrollments: 40, hours: 1250 },
    ],
    topCategories: [
      { name: "Quản lý Hạ tầng KCN", courses: 4, completion: 86 },
      { name: "PCCC & An toàn", courses: 3, completion: 92 },
      { name: "Quản lý Môi trường", courses: 3, completion: 85 },
    ],
    topDepartments: [
      { name: "Ban Quản lý Hạ tầng", completion: 88, avgScore: 8.2, activeRate: 95 },
      { name: "Ban Dịch vụ KCN", completion: 82, avgScore: 7.8, activeRate: 88 },
    ],
    recentActivity: [
      { action: "PCCC", detail: "Diễn tập PCCC toàn KCN - 150 nhân sự tham gia", time: "1 ngày trước" },
    ],
  },
  {
    id: "S13", name: "Geleximco Thương mại & XNK", shortName: "TM & XNK", sector: "trade", location: "36 Hoàng Cầu, Đống Đa, HN", employees: 200,
    totalCourses: 17, activeCourses: 14, mandatoryCourses: 6, completionRate: 81, avgScore: 7.7, activelearners: 175, certificatesIssued: 520, totalLearningHours: 8400, avgHoursPerEmployee: 42, learningPaths: 4, overdueTraining: 8, budgetUtilization: 80, complianceRate: 91, npsScore: 4.0,
    monthlyTrend: [
      { month: "T10", completions: 32, enrollments: 42, hours: 1300 },
      { month: "T11", completions: 35, enrollments: 45, hours: 1420 },
      { month: "T12", completions: 28, enrollments: 38, hours: 1180 },
      { month: "T01", completions: 40, enrollments: 52, hours: 1600 },
      { month: "T02", completions: 37, enrollments: 48, hours: 1500 },
      { month: "T03", completions: 39, enrollments: 50, hours: 1550 },
    ],
    topCategories: [
      { name: "Nghiệp vụ XNK & Logistics", courses: 5, completion: 84 },
      { name: "Thương mại Quốc tế", courses: 4, completion: 80 },
      { name: "Kỹ năng Đàm phán", courses: 3, completion: 78 },
    ],
    topDepartments: [
      { name: "Phòng XNK", completion: 85, avgScore: 8.0, activeRate: 92 },
      { name: "Phòng Logistics", completion: 82, avgScore: 7.8, activeRate: 88 },
    ],
    recentActivity: [
      { action: "Khóa mới", detail: "\"Incoterms 2026\" triển khai cho 80 chuyên viên XNK", time: "3 giờ trước" },
    ],
  },
  {
    id: "S14", name: "Geleximco Giáo dục", shortName: "Giáo dục GX", sector: "education", location: "36 Hoàng Cầu, Đống Đa, HN", employees: 85,
    totalCourses: 12, activeCourses: 11, mandatoryCourses: 4, completionRate: 90, avgScore: 8.6, activelearners: 82, certificatesIssued: 280, totalLearningHours: 4250, avgHoursPerEmployee: 50, learningPaths: 3, overdueTraining: 1, budgetUtilization: 94, complianceRate: 97, npsScore: 4.7,
    monthlyTrend: [
      { month: "T10", completions: 18, enrollments: 22, hours: 650 },
      { month: "T11", completions: 20, enrollments: 24, hours: 720 },
      { month: "T12", completions: 16, enrollments: 20, hours: 600 },
      { month: "T01", completions: 24, enrollments: 28, hours: 800 },
      { month: "T02", completions: 22, enrollments: 26, hours: 750 },
      { month: "T03", completions: 23, enrollments: 27, hours: 780 },
    ],
    topCategories: [
      { name: "Phương pháp Giảng dạy", courses: 4, completion: 94 },
      { name: "EdTech & Công nghệ GD", courses: 3, completion: 88 },
      { name: "Quản lý Đào tạo", courses: 3, completion: 92 },
    ],
    topDepartments: [
      { name: "Phòng Đào tạo", completion: 95, avgScore: 8.9, activeRate: 100 },
      { name: "Phòng Nghiên cứu GD", completion: 90, avgScore: 8.6, activeRate: 95 },
    ],
    recentActivity: [
      { action: "Best Practice", detail: "Workshop \"Thiết kế E-learning hiệu quả\" cho giảng viên", time: "5 giờ trước" },
      { action: "Pilot", detail: "Thử nghiệm AI Auto-Grading trên 3 khóa học", time: "1 ngày trước" },
    ],
  },
];

const sectorConfig: Record<string, { bg: string; text: string; label: string; color: string; icon: string }> = {
  holding: { bg: "bg-[#990803]/10", text: "text-[#990803]", label: "Tập đoàn", color: "#990803", icon: "🏢" },
  finance: { bg: "bg-blue-50", text: "text-blue-600", label: "Tài chính - NH", color: "#2e86de", icon: "🏦" },
  materials: { bg: "bg-orange-50", text: "text-orange-600", label: "VLXD", color: "#e67e22", icon: "🏭" },
  mining: { bg: "bg-purple-50", text: "text-purple-600", label: "Khoáng sản", color: "#8e44ad", icon: "⛏️" },
  energy: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Năng lượng", color: "#f39c12", icon: "⚡" },
  realestate: { bg: "bg-green-50", text: "text-green-600", label: "Bất động sản", color: "#27ae60", icon: "🏗️" },
  infrastructure: { bg: "bg-teal-50", text: "text-teal-600", label: "Hạ tầng", color: "#16a085", icon: "🛣️" },
  trade: { bg: "bg-sky-50", text: "text-sky-600", label: "Thương mại", color: "#2980b9", icon: "📦" },
  education: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Giáo dục", color: "#1abc9c", icon: "🎓" },
};

// ============================================
// CUSTOM SVG CHART COMPONENTS
// ============================================

function TrendLineChart({ data, width = 280, height = 100 }: { data: { month: string; completions: number; enrollments: number }[]; width?: number; height?: number }) {
  const maxVal = Math.max(...data.flatMap(d => [d.completions, d.enrollments]));
  const padding = { top: 10, right: 10, bottom: 22, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getY = (val: number) => padding.top + chartH - (val / maxVal) * chartH;
  const getX = (i: number) => padding.left + (i / (data.length - 1)) * chartW;

  const line = (key: "completions" | "enrollments") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${getX(i)},${getY(d[key])}`).join(" ");

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={padding.left} y1={padding.top + chartH * (1 - f)} x2={width - padding.right} y2={padding.top + chartH * (1 - f)} stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="3,3" />
      ))}
      {/* Enrollments line */}
      <path d={line("enrollments")} fill="none" stroke="#c8a84e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      {/* Completions line */}
      <path d={line("completions")} fill="none" stroke="#990803" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots & labels */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={getX(i)} cy={getY(d.completions)} r="3" fill="#990803" />
          <circle cx={getX(i)} cy={getY(d.enrollments)} r="2.5" fill="#c8a84e" />
          <text x={getX(i)} y={height - 4} textAnchor="middle" fill="currentColor" className="text-muted-foreground" style={{ fontSize: "9px" }}>{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

function CompletionBarChart({ subs, width = 500, height = 220 }: { subs: SubsidiaryTraining[]; width?: number; height?: number }) {
  const sorted = [...subs].sort((a, b) => b.completionRate - a.completionRate);
  const barH = 18;
  const gap = 5;
  const labelW = 100;
  const valueW = 40;
  const chartW = width - labelW - valueW - 20;
  const totalH = sorted.length * (barH + gap);

  return (
    <svg width={width} height={Math.max(totalH + 10, height)} className="w-full" viewBox={`0 0 ${width} ${totalH + 10}`} preserveAspectRatio="xMidYMid meet">
      {sorted.map((s, i) => {
        const y = i * (barH + gap) + 5;
        const barW = (s.completionRate / 100) * chartW;
        const color = s.completionRate >= 90 ? "#27ae60" : s.completionRate >= 80 ? "#f39c12" : s.completionRate >= 75 ? "#e67e22" : "#e74c3c";
        return (
          <g key={s.id}>
            <text x={labelW - 5} y={y + barH / 2 + 4} textAnchor="end" fill="currentColor" className="text-foreground" style={{ fontSize: "10px" }}>{s.shortName}</text>
            <rect x={labelW} y={y} width={chartW} height={barH} rx="4" fill="currentColor" className="text-secondary" />
            <rect x={labelW} y={y} width={barW} height={barH} rx="4" fill={color}>
              <animate attributeName="width" from="0" to={barW} dur="0.6s" fill="freeze" />
            </rect>
            <text x={labelW + chartW + 8} y={y + barH / 2 + 4} fill={color} style={{ fontSize: "11px", fontWeight: 700 }}>{s.completionRate}%</text>
          </g>
        );
      })}
    </svg>
  );
}

function SectorDonutChart({ subs }: { subs: SubsidiaryTraining[] }) {
  const sectorGroups = useMemo(() => {
    const groups: Record<string, { count: number; employees: number; avgCompletion: number }> = {};
    subs.forEach(s => {
      if (!groups[s.sector]) groups[s.sector] = { count: 0, employees: 0, avgCompletion: 0 };
      groups[s.sector].count++;
      groups[s.sector].employees += s.employees;
      groups[s.sector].avgCompletion += s.completionRate;
    });
    Object.keys(groups).forEach(k => {
      groups[k].avgCompletion = Math.round(groups[k].avgCompletion / groups[k].count);
    });
    return Object.entries(groups).map(([k, v]) => ({ sector: k, ...v })).sort((a, b) => b.employees - a.employees);
  }, [subs]);

  const total = sectorGroups.reduce((a, b) => a + b.employees, 0);
  const cx = 80, cy = 80, r = 60, innerR = 40;
  let cumAngle = -90;

  return (
    <div className="flex items-center gap-4">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {sectorGroups.map(g => {
          const angle = (g.employees / total) * 360;
          const startAngle = cumAngle;
          cumAngle += angle;
          const endAngle = cumAngle;
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const largeArc = angle > 180 ? 1 : 0;
          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy + r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy + r * Math.sin(endRad);
          const ix1 = cx + innerR * Math.cos(endRad);
          const iy1 = cy + innerR * Math.sin(endRad);
          const ix2 = cx + innerR * Math.cos(startRad);
          const iy2 = cy + innerR * Math.sin(startRad);
          const d = `M${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} L${ix1},${iy1} A${innerR},${innerR} 0 ${largeArc},0 ${ix2},${iy2} Z`;
          const sc = sectorConfig[g.sector];
          return <path key={g.sector} d={d} fill={sc?.color || "#999"} opacity="0.85" />;
        })}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="currentColor" className="text-card" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="currentColor" className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>{total.toLocaleString()}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="currentColor" className="text-muted-foreground" style={{ fontSize: "9px" }}>nhân sự</text>
      </svg>
      <div className="flex-1 space-y-1">
        {sectorGroups.map(g => {
          const sc = sectorConfig[g.sector];
          return (
            <div key={g.sector} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: sc?.color || "#999" }} />
              <span className="text-muted-foreground flex-1" style={{ fontSize: "11px" }}>{sc?.label || g.sector}</span>
              <span className="text-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>{g.count} đơn vị</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// DETAIL TABS
// ============================================
type DetailTab = "overview" | "courses" | "departments" | "activity";

// ============================================
// MAIN COMPONENT
// ============================================
export function Subsidiaries() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"completionRate" | "employees" | "totalCourses" | "activelearners" | "avgHoursPerEmployee">("completionRate");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedSub, setSelectedSub] = useState<SubsidiaryTraining | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");

  const tabRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return subsidiaryData
      .filter(s => {
        const ms = search.toLowerCase();
        const matchSearch = !ms || s.name.toLowerCase().includes(ms) || s.shortName.toLowerCase().includes(ms) || s.location.toLowerCase().includes(ms);
        const matchSector = sectorFilter === "all" || s.sector === sectorFilter;
        return matchSearch && matchSector;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        return ((a[sortBy] as number) - (b[sortBy] as number)) * dir;
      });
  }, [search, sectorFilter, sortBy, sortDir]);

  // Aggregated stats
  const stats = useMemo(() => {
    const all = subsidiaryData;
    return {
      totalEmployees: all.reduce((a, b) => a + b.employees, 0),
      totalCourses: all.reduce((a, b) => a + b.totalCourses, 0),
      totalActiveLearners: all.reduce((a, b) => a + b.activelearners, 0),
      totalCertificates: all.reduce((a, b) => a + b.certificatesIssued, 0),
      totalHours: all.reduce((a, b) => a + b.totalLearningHours, 0),
      avgCompletion: Math.round(all.reduce((a, b) => a + b.completionRate, 0) / all.length),
      avgNPS: (all.reduce((a, b) => a + b.npsScore, 0) / all.length).toFixed(1),
      totalOverdue: all.reduce((a, b) => a + b.overdueTraining, 0),
    };
  }, []);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return { text: "text-green-600", bg: "bg-green-500", hex: "#27ae60" };
    if (rate >= 80) return { text: "text-yellow-600", bg: "bg-yellow-500", hex: "#f39c12" };
    if (rate >= 75) return { text: "text-orange-500", bg: "bg-orange-500", hex: "#e67e22" };
    return { text: "text-red-500", bg: "bg-red-500", hex: "#e74c3c" };
  };

  const detailTabs: { key: DetailTab; label: string; icon: typeof BookOpen }[] = [
    { key: "overview", label: "Tổng quan Đào tạo", icon: BarChart3 },
    { key: "courses", label: "Danh mục Đào tạo", icon: BookOpen },
    { key: "departments", label: "Phòng ban", icon: Layers },
    { key: "activity", label: "Hoạt động Gần đây", icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>
          <Building2 className="w-6 h-6 inline mr-2 text-[#990803]" />
          Đào tạo theo Đơn vị Thành viên
        </h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
          Tổng quan tình hình đào tạo nội bộ tại 14 đơn vị trực thuộc Tập đoàn Geleximco • Cập nhật: 11/03/2026
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          { icon: Building2, label: "Đơn vị", value: "14", color: "#990803", bg: "bg-[#990803]/10" },
          { icon: Users, label: "Nhân sự", value: stats.totalEmployees.toLocaleString(), color: "#2e86de", bg: "bg-blue-50" },
          { icon: GraduationCap, label: "Học viên Active", value: stats.totalActiveLearners.toLocaleString(), color: "#27ae60", bg: "bg-green-50" },
          { icon: BookOpen, label: "Khóa học", value: stats.totalCourses.toString(), color: "#e67e22", bg: "bg-orange-50" },
          { icon: Award, label: "Chứng chỉ", value: stats.totalCertificates.toLocaleString(), color: "#8e44ad", bg: "bg-purple-50" },
          { icon: Clock, label: "Giờ học", value: (stats.totalHours / 1000).toFixed(0) + "K", color: "#16a085", bg: "bg-teal-50" },
          { icon: Percent, label: "TB Hoàn thành", value: stats.avgCompletion + "%", color: "#c8a84e", bg: "bg-[#c8a84e]/10" },
          { icon: AlertTriangle, label: "Quá hạn", value: stats.totalOverdue.toString(), color: "#e74c3c", bg: "bg-red-50" },
        ].map((item, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-3">
            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
            <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{item.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Completion Ranking */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Trophy className="w-4 h-4 inline mr-1.5 text-[#c8a84e]" />
            Bảng xếp hạng Tỷ lệ Hoàn thành Đào tạo
          </h3>
          <div className="overflow-x-auto">
            <CompletionBarChart subs={subsidiaryData} />
          </div>
        </div>
        {/* Sector Distribution */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Layers className="w-4 h-4 inline mr-1.5 text-[#990803]" />
            Phân bổ Nhân sự theo Lĩnh vực
          </h3>
          <SectorDonutChart subs={subsidiaryData} />
          <div className="mt-4 pt-3 border-t border-border">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Lĩnh vực", value: "9" },
                { label: "NPS TB", value: stats.avgNPS },
                { label: "Tuân thủ TB", value: Math.round(subsidiaryData.reduce((a, b) => a + b.complianceRate, 0) / 14) + "%" },
              ].map((s, i) => (
                <div key={i} className="text-center p-2 bg-secondary/30 rounded-lg">
                  <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{s.value}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Tìm đơn vị, địa điểm..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none text-foreground"
              style={{ fontSize: "13px" }}
            />
          </div>
          <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
            className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
            <option value="all">Tất cả lĩnh vực</option>
            {Object.entries(sectorConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
            <option value="completionRate">Sắp xếp: Hoàn thành</option>
            <option value="employees">Sắp xếp: Nhân sự</option>
            <option value="totalCourses">Sắp xếp: Khóa học</option>
            <option value="activelearners">Sắp xếp: Học viên Active</option>
            <option value="avgHoursPerEmployee">Sắp xếp: Giờ/NS</option>
          </select>
          <button onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
            className="px-3 py-2.5 bg-input-background rounded-lg text-foreground hover:bg-secondary cursor-pointer" style={{ fontSize: "13px" }}>
            {sortDir === "desc" ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
          </button>
          <div className="flex gap-1">
            <button onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#990803] text-white" : "bg-input-background text-muted-foreground"}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("table")}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer ${viewMode === "table" ? "bg-[#990803] text-white" : "bg-input-background text-muted-foreground"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
        Hiển thị <span className="text-foreground" style={{ fontWeight: 600 }}>{filtered.length}</span> / {subsidiaryData.length} đơn vị
      </p>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(sub => {
            const sc = sectorConfig[sub.sector] || sectorConfig.holding;
            const cc = getCompletionColor(sub.completionRate);
            return (
              <div key={sub.id} className="bg-card rounded-xl border border-border hover:shadow-lg hover:border-[#990803]/30 transition-all group overflow-hidden cursor-pointer"
                onClick={() => { setSelectedSub(sub); setDetailTab("overview"); }}>
                {/* Card header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`} style={{ fontSize: "10px", fontWeight: 600 }}>
                          {sc.icon} {sc.label}
                        </span>
                        {sub.overdueTraining > 10 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-500" style={{ fontSize: "9px", fontWeight: 600 }}>
                            {sub.overdueTraining} quá hạn
                          </span>
                        )}
                      </div>
                      <h3 className="text-foreground truncate" style={{ fontSize: "15px", fontWeight: 600 }}>{sub.shortName}</h3>
                      <p className="text-muted-foreground truncate" style={{ fontSize: "11px" }}>{sub.name}</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-border group-hover:border-[#990803]/30 transition-colors"
                      style={{ background: `${sc.color}10` }}>
                      <Building2 className="w-5 h-5 group-hover:text-[#990803] transition-colors" style={{ color: sc.color }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-3" style={{ fontSize: "11px" }}>
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{sub.location}</span>
                  </div>
                </div>

                {/* Training metrics grid */}
                <div className="px-5 pb-3">
                  <div className="grid grid-cols-4 gap-2 py-3 border-t border-border">
                    {[
                      { label: "Khóa học", value: sub.totalCourses, sub: `${sub.activeCourses} active` },
                      { label: "Học viên", value: sub.activelearners, sub: `/${sub.employees} NS` },
                      { label: "Chứng chỉ", value: sub.certificatesIssued, sub: "đã cấp" },
                      { label: "Giờ/NS", value: sub.avgHoursPerEmployee, sub: "TB" },
                    ].map((m, i) => (
                      <div key={i} className="text-center">
                        <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{typeof m.value === "number" ? m.value.toLocaleString() : m.value}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{m.label}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "8px" }}>{m.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress + compliance */}
                <div className="px-5 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Hoàn thành đào tạo</span>
                    <span className={cc.text} style={{ fontSize: "13px", fontWeight: 700 }}>{sub.completionRate}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${cc.bg} transition-all`} style={{ width: `${sub.completionRate}%` }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Tuân thủ: {sub.complianceRate}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#c8a84e]" />
                      <span className="text-muted-foreground" style={{ fontSize: "10px" }}>NPS: {sub.npsScore}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <RouteIcon className="w-3 h-3 text-[#990803]" />
                      <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{sub.learningPaths} lộ trình</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                  <div className="flex gap-1">
                    {sub.topCategories.slice(0, 2).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "9px" }}>{c.name.split(" ").slice(0, 2).join(" ")}</span>
                    ))}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedSub(sub); setDetailTab("overview"); }} className="flex items-center gap-1 text-[#990803] hover:underline cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}>
                    Chi tiết <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {[
                    { key: "name", label: "Đơn vị", sortable: false },
                    { key: "employees", label: "Nhân sự", sortable: true },
                    { key: "totalCourses", label: "Khóa học", sortable: true },
                    { key: "activelearners", label: "Học viên", sortable: true },
                    { key: "completionRate", label: "Hoàn thành", sortable: true },
                    { key: "complianceRate", label: "Tuân thủ", sortable: false },
                    { key: "avgHoursPerEmployee", label: "Giờ/NS", sortable: true },
                    { key: "certificatesIssued", label: "Chứng chỉ", sortable: false },
                    { key: "action", label: "", sortable: false },
                  ].map(col => (
                    <th key={col.key}
                      className={`text-left py-3 px-3 text-muted-foreground ${col.sortable ? "cursor-pointer hover:text-foreground" : ""}`}
                      style={{ fontSize: "11px", fontWeight: 500 }}
                      onClick={() => col.sortable && toggleSort(col.key as any)}>
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && sortBy === col.key && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => {
                  const sc = sectorConfig[sub.sector] || sectorConfig.holding;
                  const cc = getCompletionColor(sub.completionRate);
                  return (
                    <tr key={sub.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => { setSelectedSub(sub); setDetailTab("overview"); }}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${sc.color}15` }}>
                            <Building2 className="w-4 h-4" style={{ color: sc.color }} />
                          </div>
                          <div>
                            <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{sub.shortName}</p>
                            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                              <span className={sc.text}>{sc.label}</span> • {sub.location.split(",")[0]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-foreground" style={{ fontSize: "13px" }}>{sub.employees.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className="text-foreground" style={{ fontSize: "13px" }}>{sub.totalCourses}</span>
                        <span className="text-muted-foreground" style={{ fontSize: "10px" }}> ({sub.activeCourses})</span>
                      </td>
                      <td className="py-3 px-3 text-foreground" style={{ fontSize: "13px" }}>{sub.activelearners.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${cc.bg}`} style={{ width: `${sub.completionRate}%` }} />
                          </div>
                          <span className={cc.text} style={{ fontSize: "12px", fontWeight: 600 }}>{sub.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={sub.complianceRate >= 95 ? "text-green-600" : sub.complianceRate >= 90 ? "text-yellow-600" : "text-red-500"} style={{ fontSize: "12px", fontWeight: 500 }}>
                          {sub.complianceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-foreground" style={{ fontSize: "13px" }}>{sub.avgHoursPerEmployee}h</td>
                      <td className="py-3 px-3 text-foreground" style={{ fontSize: "13px" }}>{sub.certificatesIssued.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedSub(sub); setDetailTab("overview"); }} className="p-1.5 hover:bg-secondary rounded-lg transition-colors cursor-pointer" title="Xem chi tiết">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSub(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#990803] to-[#b82020] p-5 rounded-t-2xl shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-white/20 text-white" style={{ fontSize: "10px", fontWeight: 600 }}>
                      {sectorConfig[selectedSub.sector]?.icon} {sectorConfig[selectedSub.sector]?.label}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#c8a84e] text-[#990803]" style={{ fontSize: "10px", fontWeight: 600 }}>
                      {selectedSub.employees} nhân sự
                    </span>
                  </div>
                  <h2 className="text-white" style={{ fontSize: "20px", fontWeight: 700 }}>{selectedSub.name}</h2>
                  <p className="text-white/60 mt-1 flex items-center gap-1" style={{ fontSize: "12px" }}>
                    <MapPin className="w-3 h-3" /> {selectedSub.location}
                  </p>
                </div>
                <button onClick={() => setSelectedSub(null)} className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Quick Stats in Header */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { label: "Hoàn thành ĐT", value: `${selectedSub.completionRate}%`, icon: Target },
                  { label: "Tuân thủ", value: `${selectedSub.complianceRate}%`, icon: CheckCircle2 },
                  { label: "NPS Score", value: selectedSub.npsScore.toString(), icon: Star },
                  { label: "Ngân sách SD", value: `${selectedSub.budgetUtilization}%`, icon: TrendingUp },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-2.5 text-center">
                    <s.icon className="w-3.5 h-3.5 text-white/60 mx-auto mb-1" />
                    <p className="text-white" style={{ fontSize: "16px", fontWeight: 700 }}>{s.value}</p>
                    <p className="text-white/50" style={{ fontSize: "9px" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border shrink-0">
              <div ref={tabRef} className="flex overflow-x-auto scrollbar-hide">
                {detailTabs.map(tab => (
                  <button key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-3 shrink-0 border-b-2 transition-colors cursor-pointer ${
                      detailTab === tab.key ? "border-[#990803] text-[#990803]" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ fontSize: "12px", fontWeight: detailTab === tab.key ? 600 : 400 }}>
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {detailTab === "overview" && (
                <div className="space-y-5">
                  {/* Training KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: BookOpen, label: "Tổng Khóa học", value: selectedSub.totalCourses, sub: `${selectedSub.activeCourses} đang hoạt động`, color: "#2e86de" },
                      { icon: GraduationCap, label: "Học viên Active", value: selectedSub.activelearners, sub: `${Math.round(selectedSub.activelearners / selectedSub.employees * 100)}% nhân sự`, color: "#27ae60" },
                      { icon: Award, label: "Chứng chỉ Cấp", value: selectedSub.certificatesIssued.toLocaleString(), sub: `${Math.round(selectedSub.certificatesIssued / selectedSub.employees * 10) / 10}/NS`, color: "#8e44ad" },
                      { icon: Clock, label: "Tổng Giờ học", value: selectedSub.totalLearningHours.toLocaleString(), sub: `${selectedSub.avgHoursPerEmployee}h/NS`, color: "#16a085" },
                    ].map((kpi, i) => (
                      <div key={i} className="bg-secondary/30 rounded-xl p-3.5">
                        <kpi.icon className="w-4 h-4 mb-2" style={{ color: kpi.color }} />
                        <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{kpi.value}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{kpi.label}</p>
                        <p className="text-muted-foreground mt-0.5" style={{ fontSize: "9px" }}>{kpi.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Additional metrics row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-secondary/30 rounded-xl p-3.5 text-center">
                      <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{selectedSub.learningPaths}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Lộ trình Đào tạo</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-3.5 text-center">
                      <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{selectedSub.mandatoryCourses}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Khóa Bắt buộc</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-3.5 text-center">
                      <p className={selectedSub.overdueTraining > 10 ? "text-red-500" : "text-foreground"} style={{ fontSize: "20px", fontWeight: 700 }}>{selectedSub.overdueTraining}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Quá hạn Đào tạo</p>
                    </div>
                  </div>

                  {/* Trend Chart */}
                  <div>
                    <h4 className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                      <TrendingUp className="w-4 h-4 inline mr-1.5 text-[#990803]" />
                      Xu hướng Đào tạo 6 tháng gần nhất
                    </h4>
                    <div className="bg-secondary/20 rounded-xl p-4">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-0.5 bg-[#990803] rounded" />
                          <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Hoàn thành</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-0.5 bg-[#c8a84e] rounded" />
                          <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Đăng ký mới</span>
                        </div>
                      </div>
                      <TrendLineChart data={selectedSub.monthlyTrend} />
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div>
                    <h4 className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                      <BarChart3 className="w-4 h-4 inline mr-1.5 text-[#990803]" />
                      Chỉ số Đào tạo Chính
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: "Tỷ lệ Hoàn thành Đào tạo", value: selectedSub.completionRate },
                        { label: "Tỷ lệ Tuân thủ Bắt buộc", value: selectedSub.complianceRate },
                        { label: "Sử dụng Ngân sách ĐT", value: selectedSub.budgetUtilization },
                        { label: "Tỷ lệ Tham gia Active", value: Math.round(selectedSub.activelearners / selectedSub.employees * 100) },
                      ].map((bar, i) => {
                        const cc2 = getCompletionColor(bar.value);
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{bar.label}</span>
                              <span className={cc2.text} style={{ fontSize: "13px", fontWeight: 700 }}>{bar.value}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${cc2.bg} transition-all`} style={{ width: `${bar.value}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {detailTab === "courses" && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                      <BookOpen className="w-4 h-4 inline mr-1.5 text-[#990803]" />
                      Danh mục Đào tạo chính ({selectedSub.topCategories.length} danh mục)
                    </h4>
                    <div className="space-y-2">
                      {selectedSub.topCategories.map((cat, i) => {
                        const cc2 = getCompletionColor(cat.completion);
                        return (
                          <div key={i} className="bg-secondary/30 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{cat.name}</p>
                                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>{cat.courses} khóa học</p>
                              </div>
                              <span className={cc2.text} style={{ fontSize: "15px", fontWeight: 700 }}>{cat.completion}%</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${cc2.bg}`} style={{ width: `${cat.completion}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-[#990803]/5 rounded-xl p-4 border border-[#990803]/10">
                    <h4 className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                      <Target className="w-4 h-4 inline mr-1.5 text-[#990803]" />
                      Tổng hợp Đào tạo
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Tổng khóa học", value: selectedSub.totalCourses },
                        { label: "Đang hoạt động", value: selectedSub.activeCourses },
                        { label: "Bắt buộc", value: selectedSub.mandatoryCourses },
                        { label: "Lộ trình ĐT", value: selectedSub.learningPaths },
                      ].map((s, i) => (
                        <div key={i} className="text-center p-2.5 bg-card rounded-lg border border-border">
                          <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{s.value}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mandatory vs Elective visual */}
                  <div>
                    <h4 className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bổ Khóa học</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden flex">
                        <div className="h-full bg-[#990803] flex items-center justify-center" style={{ width: `${(selectedSub.mandatoryCourses / selectedSub.totalCourses) * 100}%` }}>
                          <span className="text-white px-1" style={{ fontSize: "9px", fontWeight: 600 }}>Bắt buộc: {selectedSub.mandatoryCourses}</span>
                        </div>
                        <div className="h-full bg-[#c8a84e] flex items-center justify-center flex-1">
                          <span className="text-[#990803] px-1" style={{ fontSize: "9px", fontWeight: 600 }}>Tự chọn: {selectedSub.totalCourses - selectedSub.mandatoryCourses}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === "departments" && (
                <div className="space-y-4">
                  <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                    <Layers className="w-4 h-4 inline mr-1.5 text-[#990803]" />
                    Hiệu suất Đào tạo theo Phòng ban ({selectedSub.topDepartments.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedSub.topDepartments.map((dept, i) => {
                      const cc2 = getCompletionColor(dept.completion);
                      return (
                        <div key={i} className="bg-secondary/30 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#990803] text-white flex items-center justify-center shrink-0" style={{ fontSize: "12px", fontWeight: 700 }}>
                                #{i + 1}
                              </div>
                              <div>
                                <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{dept.name}</p>
                                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tỷ lệ tham gia: {dept.activeRate}%</p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="text-center p-2 bg-card rounded-lg border border-border">
                              <p className={cc2.text} style={{ fontSize: "16px", fontWeight: 700 }}>{dept.completion}%</p>
                              <p className="text-muted-foreground" style={{ fontSize: "9px" }}>Hoàn thành</p>
                            </div>
                            <div className="text-center p-2 bg-card rounded-lg border border-border">
                              <p className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>{dept.avgScore}</p>
                              <p className="text-muted-foreground" style={{ fontSize: "9px" }}>Điểm TB</p>
                            </div>
                            <div className="text-center p-2 bg-card rounded-lg border border-border">
                              <p className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>{dept.activeRate}%</p>
                              <p className="text-muted-foreground" style={{ fontSize: "9px" }}>Active</p>
                            </div>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${cc2.bg}`} style={{ width: `${dept.completion}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {detailTab === "activity" && (
                <div className="space-y-4">
                  <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                    <Zap className="w-4 h-4 inline mr-1.5 text-[#c8a84e]" />
                    Hoạt động Đào tạo Gần đây
                  </h4>
                  <div className="space-y-3">
                    {selectedSub.recentActivity.map((act, i) => (
                      <div key={i} className="flex gap-3 p-3.5 bg-secondary/30 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-[#990803] mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-2 py-0.5 rounded bg-[#990803]/10 text-[#990803]" style={{ fontSize: "10px", fontWeight: 600 }}>{act.action}</span>
                            <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{act.time}</span>
                          </div>
                          <p className="text-foreground" style={{ fontSize: "13px" }}>{act.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Monthly stats summary */}
                  <div className="bg-[#990803]/5 rounded-xl p-4 border border-[#990803]/10">
                    <h4 className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                      <Calendar className="w-4 h-4 inline mr-1.5 text-[#990803]" />
                      Thống kê Tháng gần nhất
                    </h4>
                    {(() => {
                      const last = selectedSub.monthlyTrend[selectedSub.monthlyTrend.length - 1];
                      const prev = selectedSub.monthlyTrend[selectedSub.monthlyTrend.length - 2];
                      const compDelta = last.completions - prev.completions;
                      const enrDelta = last.enrollments - prev.enrollments;
                      return (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 bg-card rounded-lg border border-border">
                            <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{last.completions}</p>
                            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Lượt hoàn thành</p>
                            <p className={compDelta >= 0 ? "text-green-500" : "text-red-500"} style={{ fontSize: "10px", fontWeight: 500 }}>
                              {compDelta >= 0 ? "+" : ""}{compDelta} vs tháng trước
                            </p>
                          </div>
                          <div className="text-center p-3 bg-card rounded-lg border border-border">
                            <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{last.enrollments}</p>
                            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Đăng ký mới</p>
                            <p className={enrDelta >= 0 ? "text-green-500" : "text-red-500"} style={{ fontSize: "10px", fontWeight: 500 }}>
                              {enrDelta >= 0 ? "+" : ""}{enrDelta} vs tháng trước
                            </p>
                          </div>
                          <div className="text-center p-3 bg-card rounded-lg border border-border">
                            <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{last.hours.toLocaleString()}</p>
                            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Giờ học</p>
                            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                              {Math.round(last.hours / selectedSub.employees * 10) / 10}h/NS
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border shrink-0">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                Dữ liệu cập nhật: 11/03/2026 • Tổng {selectedSub.employees} nhân sự
              </p>
              <button onClick={() => setSelectedSub(null)}
                className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                style={{ fontSize: "12px", fontWeight: 500 }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="mt-3 text-foreground" style={{ fontSize: "15px", fontWeight: 500 }}>Không tìm thấy đơn vị</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
}
