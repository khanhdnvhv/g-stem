// ============================================================
// GRADING MODULE — Mock Data & Types
// Geleximco LMS — Comprehensive Grading System
// ============================================================

import { SUBSIDIARIES, DEPARTMENTS } from "../mock-data";

// ─── Types ───

export type SubmissionStatus = "pending" | "graded" | "late" | "resubmit" | "appeal" | "draft";
export type SubmissionType = "essay" | "file_upload" | "quiz" | "project" | "presentation";
export type AppealStatus = "pending" | "reviewing" | "resolved" | "rejected";
export type GradeAction = "graded" | "revised" | "resubmit_request" | "appeal_filed" | "appeal_resolved" | "override" | "auto_graded";
export type GradingPolicyScale = "100" | "10" | "letter";

export interface GradingSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string; // initials
  subsidiary: string;
  department: string;
  courseId: string;
  courseName: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentType: SubmissionType;
  submittedAt: string;
  dueDate: string;
  status: SubmissionStatus;
  score: number | null;
  maxScore: number;
  percentage: number | null;
  letterGrade: string | null;
  feedback: string;
  feedbackSnippets: string[];
  rubricId: string | null;
  rubricScores: Record<string, number> | null; // criteriaId -> score
  fileCount: number;
  fileNames: string[];
  essayContent: string | null;
  wordCount: number | null;
  isOverdue: boolean;
  previousSubmissionId: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
  aiSuggested: boolean;
  aiScore: number | null;
  priority: "critical" | "high" | "medium" | "low";
  tags: string[];
}

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight: number; // percentage
  levels: {
    label: string;
    description: string;
    minScore: number;
    maxScore: number;
  }[];
}

export interface Rubric {
  id: string;
  name: string;
  description: string;
  courseId: string;
  courseName: string;
  criteria: RubricCriteria[];
  totalMaxScore: number;
  createdBy: string;
  createdAt: string;
  usageCount: number;
  isShared: boolean;
}

export interface GradeHistoryEntry {
  id: string;
  submissionId: string;
  studentName: string;
  courseName: string;
  assignmentTitle: string;
  action: GradeAction;
  performedBy: string;
  performedByRole: "instructor" | "admin" | "system";
  timestamp: string;
  oldScore: number | null;
  newScore: number | null;
  maxScore: number;
  reason: string;
  feedback: string;
}

export interface GradeAppeal {
  id: string;
  submissionId: string;
  studentId: string;
  studentName: string;
  subsidiary: string;
  courseId: string;
  courseName: string;
  assignmentTitle: string;
  currentScore: number;
  maxScore: number;
  reason: string;
  evidence: string;
  status: AppealStatus;
  filedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  newScore: number | null;
  resolution: string;
  instructorName: string;
}

export interface SubsidiaryGradeStats {
  subsidiary: string;
  totalGraded: number;
  avgScore: number;
  passRate: number;
  pendingCount: number;
  totalStudents: number;
  topCourse: string;
  weakestCourse: string;
  monthlyTrend: number[]; // 6 months
}

export interface InstructorMetric {
  id: string;
  name: string;
  subsidiary: string;
  department: string;
  initials: string;
  totalGraded: number;
  pendingCount: number;
  avgGradingTimeMinutes: number;
  avgScore: number;
  consistencyScore: number; // 0-100
  avgFeedbackLength: number; // chars
  coursesAssigned: number;
  lastGradedAt: string;
  rating: number;
}

export interface GradebookEntry {
  studentId: string;
  studentName: string;
  subsidiary: string;
  department: string;
  initials: string;
  scores: Record<string, { score: number | null; maxScore: number; status: SubmissionStatus; gradedAt: string | null }>;
  average: number | null;
  rank: number | null;
}

export interface GradingPolicy {
  scale: GradingPolicyScale;
  passingThreshold: number;
  weights: { assignment: number; midterm: number; final: number };
  autoLockDays: number;
  requireApproval: boolean;
}

// ─── Constants ───

export const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; bg: string; textColor: string }> = {
  pending: { label: "Chờ chấm", color: "#f59e0b", bg: "#fef3c7", textColor: "text-yellow-700" },
  graded: { label: "Đã chấm", color: "#22c55e", bg: "#dcfce7", textColor: "text-green-700" },
  late: { label: "Nộp muộn", color: "#ef4444", bg: "#fee2e2", textColor: "text-red-600" },
  resubmit: { label: "Nộp lại", color: "#f97316", bg: "#ffedd5", textColor: "text-orange-600" },
  appeal: { label: "Khiếu nại", color: "#8b5cf6", bg: "#ede9fe", textColor: "text-purple-600" },
  draft: { label: "Nháp", color: "#6b7280", bg: "#f3f4f6", textColor: "text-gray-600" },
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Khẩn cấp", color: "#dc2626", bg: "#fef2f2" },
  high: { label: "Cao", color: "#f97316", bg: "#fff7ed" },
  medium: { label: "Trung bình", color: "#eab308", bg: "#fefce8" },
  low: { label: "Thấp", color: "#22c55e", bg: "#f0fdf4" },
};

export const LETTER_GRADES = [
  { letter: "A+", min: 95, color: "#16a34a" },
  { letter: "A", min: 90, color: "#22c55e" },
  { letter: "B+", min: 85, color: "#65a30d" },
  { letter: "B", min: 80, color: "#84cc16" },
  { letter: "C+", min: 75, color: "#eab308" },
  { letter: "C", min: 70, color: "#f59e0b" },
  { letter: "D+", min: 65, color: "#f97316" },
  { letter: "D", min: 60, color: "#ea580c" },
  { letter: "F", min: 0, color: "#dc2626" },
];

export function getLetterGrade(percentage: number): string {
  for (const g of LETTER_GRADES) {
    if (percentage >= g.min) return g.letter;
  }
  return "F";
}

export function getLetterColor(letter: string): string {
  return LETTER_GRADES.find(g => g.letter === letter)?.color || "#6b7280";
}

// ─── Vietnamese Names Generator ───
const FIRST_NAMES = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Dang", "Bui", "Do", "Ngo", "Duong", "Ly"];
const MIDDLE_NAMES = ["Van", "Thi", "Duc", "Minh", "Hong", "Quang", "Thanh", "Bich", "Anh", "Dinh"];
const LAST_NAMES_VN = [
  "Ha", "Anh", "Chau", "Son", "Trang", "Huy", "Ngoc", "Long", "Linh", "Khoa",
  "Dung", "Phuong", "Tung", "Mai", "Thao", "Hung", "Lan", "Duc", "Yen", "Khanh",
  "Quan", "Hien", "Bao", "Nhi", "Phuc",
];

function genName(i: number): string {
  const f = FIRST_NAMES[i % FIRST_NAMES.length];
  const m = MIDDLE_NAMES[i % MIDDLE_NAMES.length];
  const l = LAST_NAMES_VN[i % LAST_NAMES_VN.length];
  return `${f} ${m} ${l}`;
}
function genInitials(name: string): string {
  return name.split(" ").map(w => w[0]).slice(-2).join("");
}

// ─── Courses used in grading ───
export const GRADING_COURSES = [
  { id: "C001", name: "Ky nang Lanh dao cho Quan ly Cap trung", instructor: "TS. Nguyen Van Hung" },
  { id: "C003", name: "Phan tich Tai chinh Doanh nghiep", instructor: "ThS. Le Thi Thu Ha" },
  { id: "C004", name: "Marketing so & Truyen thong Thuong hieu", instructor: "ThS. Pham Anh Tuan" },
  { id: "C005", name: "Quan ly Du an theo chuan PMI", instructor: "PMP. Hoang Dinh Nam" },
  { id: "C002", name: "An toan Lao dong trong Xay dung & Khai khoang", instructor: "KS. Tran Minh Duc" },
  { id: "C006", name: "Onboarding - Chao mung Thanh vien moi", instructor: "HR Team" },
  { id: "C007", name: "Tuan thu Phap luat Doanh nghiep", instructor: "LS. Nguyen Thi Lan" },
  { id: "C008", name: "Ky nang Teamwork & Giao tiep Hieu qua", instructor: "ThS. Vu Minh Chau" },
];

// ─── Assignments ───
export const GRADING_ASSIGNMENTS = [
  { id: "A001", courseId: "C004", title: "Phan tich chien dich Facebook Ads", type: "essay" as SubmissionType, maxScore: 100 },
  { id: "A002", courseId: "C004", title: "Lap ke hoach SEO cho du an BDS", type: "essay" as SubmissionType, maxScore: 100 },
  { id: "A003", courseId: "C004", title: "Viet content cho Landing Page", type: "file_upload" as SubmissionType, maxScore: 100 },
  { id: "A004", courseId: "C004", title: "Xay dung Content Calendar thang 4", type: "project" as SubmissionType, maxScore: 100 },
  { id: "A005", courseId: "C004", title: "Bai kiem tra giua ky Marketing so", type: "quiz" as SubmissionType, maxScore: 100 },
  { id: "A006", courseId: "C001", title: "Case Study: Chien luoc lanh dao trong khung hoang", type: "essay" as SubmissionType, maxScore: 100 },
  { id: "A007", courseId: "C001", title: "Bai tap: Mo hinh Servant Leadership", type: "essay" as SubmissionType, maxScore: 100 },
  { id: "A008", courseId: "C003", title: "Phan tich BCTC cua ABBank Q3/2025", type: "file_upload" as SubmissionType, maxScore: 100 },
  { id: "A009", courseId: "C003", title: "Bai kiem tra: Dinh gia doanh nghiep (DCF)", type: "quiz" as SubmissionType, maxScore: 100 },
  { id: "A010", courseId: "C005", title: "Lap WBS cho du an KDT 50ha", type: "project" as SubmissionType, maxScore: 100 },
  { id: "A011", courseId: "C005", title: "Trinh bay: Quan ly rui ro du an", type: "presentation" as SubmissionType, maxScore: 100 },
  { id: "A012", courseId: "C002", title: "Bai kiem tra An toan lao dong", type: "quiz" as SubmissionType, maxScore: 100 },
];

// ─── MOCK SUBMISSIONS (~42) ───
const essaySamples = [
  "Chien dich Facebook Ads cua du an KDT An Khanh da dat duoc nhieu ket qua tich cuc. Voi ngan sach 50 trieu dong trong 30 ngay, chien dich da tiep can 1.2 trieu nguoi dung muc tieu, tao ra 3,500 lead va 120 don dat coc. Chi phi CPL trung binh 14,285 dong, thap hon 30% so voi benchmark nganh BDS. Tuy nhien, ty le chuyen doi tu lead sang dat coc chi dat 3.4%, cho thay can cai thien chat luong lead thong qua viec toi uu doi tuong va noi dung quang cao.",
  "Ke hoach SEO cho du an BDS Geleximco Le Trong Tan bao gom 3 giai doan chinh: (1) On-page SEO - toi uu 45 trang san pham voi tu khoa muc tieu, cai thien toc do tai trang xuong duoi 3s, (2) Content Marketing - xay dung 20 bai blog/thang ve thi truong BDS Ha Dong, (3) Link Building - hop tac voi 15 website BDS uy tin. Du kien sau 6 thang, organic traffic tang 200%, tu khoa top 10 tang tu 5 len 25.",
  "Landing page cho du an Duong Noi can tap trung vao 3 yeu to chinh: headline hap dan noi bat loi the vi tri, CTA ro rang voi uu dai giai doan 1, va social proof tu cu dan hien tai. Layout nen su dung hero image full-width voi video tour 360 do, theo sau la section diem noi bat du an, bang gia va form dang ky nhan bao gia.",
  "Phan tich chien luoc lanh dao trong khung hoang tai Geleximco cho thay su ket hop giua mo hinh Servant Leadership va Transformational Leadership da giup tap doan vuot qua giai doan kho khan 2020-2021. Ban lanh dao da uu tien 3 yeu to: (1) Truyen thong minh bach voi toan bo 6,610 nhan su, (2) Ho tro tai chinh va phuc loi cho nhan vien, (3) Chuyen doi so nhanh de duy tri hoat dong. Ket qua la ty le nghi viec giam 40% so voi trung binh nganh.",
];

function generateSubmissions(): GradingSubmission[] {
  const subs: GradingSubmission[] = [];
  const statuses: SubmissionStatus[] = ["pending", "pending", "pending", "pending", "graded", "graded", "late", "resubmit", "pending", "graded", "pending", "late", "graded", "pending", "graded", "resubmit", "pending", "graded", "appeal", "pending", "graded", "pending", "pending", "graded", "late", "graded", "pending", "graded", "pending", "graded", "pending", "draft", "pending", "graded", "late", "pending", "graded", "pending", "graded", "pending", "graded", "pending"];

  for (let i = 0; i < 42; i++) {
    const name = genName(i);
    const initials = genInitials(name);
    const assignment = GRADING_ASSIGNMENTS[i % GRADING_ASSIGNMENTS.length];
    const course = GRADING_COURSES.find(c => c.id === assignment.courseId)!;
    const sub = SUBSIDIARIES[i % SUBSIDIARIES.length];
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const status = statuses[i];
    const isGraded = status === "graded" || status === "appeal";
    const isLate = status === "late";
    const dayOffset = Math.floor(i * 0.7) + 1;
    const dueDate = `2026-03-${String(Math.min(28, 5 + (i % 20))).padStart(2, "0")}`;
    const submitDate = `2026-03-${String(Math.min(28, 3 + dayOffset)).padStart(2, "0")}`;
    const submitHour = `${String(8 + (i % 12)).padStart(2, "0")}:${String((i * 17) % 60).padStart(2, "0")}`;

    const score = isGraded ? Math.floor(45 + Math.random() * 50 + (i % 7)) : null;
    const clampedScore = score !== null ? Math.min(100, score) : null;
    const pct = clampedScore;
    const letter = pct !== null ? getLetterGrade(pct) : null;

    const isEssay = assignment.type === "essay";
    const priority: GradingSubmission["priority"] =
      isLate ? "critical" :
      status === "pending" && i % 5 === 0 ? "high" :
      status === "pending" ? "medium" : "low";

    const feedbacks = [
      "Bai viet tot, co chieu sau phan tich. Can cai thien phan ket luan.",
      "Noi dung dat yeu cau, tuy nhien can bo sung them so lieu minh chung.",
      "Rat tot! Phan tich SWOT chi tiet va co tinh ung dung cao.",
      "Chua dat yeu cau. Can lam lai phan phan tich doi thu canh tranh.",
      "Bai trinh bay chuyen nghiep, slide dep. Can them phan Q&A.",
      "Du lieu phan tich chinh xac. Can trinh bay logic hon.",
      "Case study hay, co goc nhin da chieu. Diem tot.",
      "Can cai thien CTA va customer journey mapping.",
    ];

    subs.push({
      id: `GS${String(i + 1).padStart(3, "0")}`,
      studentId: `E${String(100 + i).padStart(3, "0")}`,
      studentName: name,
      studentAvatar: initials,
      subsidiary: sub,
      department: dept,
      courseId: course.id,
      courseName: course.name,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      assignmentType: assignment.type,
      submittedAt: `${submitDate} ${submitHour}`,
      dueDate,
      status,
      score: clampedScore,
      maxScore: assignment.maxScore,
      percentage: pct,
      letterGrade: letter,
      feedback: isGraded ? feedbacks[i % feedbacks.length] : "",
      feedbackSnippets: [],
      rubricId: isEssay ? `RB${String((i % 5) + 1).padStart(3, "0")}` : null,
      rubricScores: isGraded && isEssay ? {
        [`RC${String((i % 5) * 4 + 1).padStart(3, "0")}`]: Math.floor(6 + Math.random() * 5),
        [`RC${String((i % 5) * 4 + 2).padStart(3, "0")}`]: Math.floor(5 + Math.random() * 5),
        [`RC${String((i % 5) * 4 + 3).padStart(3, "0")}`]: Math.floor(7 + Math.random() * 4),
        [`RC${String((i % 5) * 4 + 4).padStart(3, "0")}`]: Math.floor(6 + Math.random() * 5),
      } : null,
      fileCount: isEssay ? 0 : 1 + (i % 4),
      fileNames: isEssay ? [] : [`bai_tap_${i + 1}.${i % 2 === 0 ? "pdf" : "docx"}`, ...(i % 3 === 0 ? [`phu_luc_${i + 1}.xlsx`] : [])],
      essayContent: isEssay ? essaySamples[i % essaySamples.length] : null,
      wordCount: isEssay ? 150 + (i * 37) % 400 : null,
      isOverdue: isLate || (status === "pending" && i % 6 === 0),
      previousSubmissionId: status === "resubmit" ? `GS${String(Math.max(1, i - 5)).padStart(3, "0")}` : null,
      gradedBy: isGraded ? (i % 3 === 0 ? "TS. Nguyen Van Hung" : "ThS. Pham Anh Tuan") : null,
      gradedAt: isGraded ? `${submitDate} ${String(14 + (i % 6)).padStart(2, "0")}:${String((i * 23) % 60).padStart(2, "0")}` : null,
      aiSuggested: isEssay && i % 3 === 0,
      aiScore: isEssay && i % 3 === 0 ? Math.floor(55 + Math.random() * 40) : null,
      priority,
      tags: assignment.type === "essay" ? ["tu_luan"] : assignment.type === "quiz" ? ["trac_nghiem"] : ["bai_tap"],
    });
  }
  return subs;
}

export const MOCK_SUBMISSIONS = generateSubmissions();

// ─── MOCK RUBRICS (5) ───
export const MOCK_RUBRICS: Rubric[] = [
  {
    id: "RB001",
    name: "Rubric Phan tich Marketing",
    description: "Danh gia bai phan tich chien dich marketing so, bao gom kha nang phan tich du lieu, de xuat giai phap va trinh bay.",
    courseId: "C004",
    courseName: "Marketing so & Truyen thong Thuong hieu",
    totalMaxScore: 100,
    createdBy: "ThS. Pham Anh Tuan",
    createdAt: "2025-12-01",
    usageCount: 18,
    isShared: true,
    criteria: [
      {
        id: "RC001", name: "Phan tich Du lieu", description: "Kha nang thu thap, xu ly va dien giai du lieu marketing", maxScore: 30, weight: 30,
        levels: [
          { label: "Xuat sac", description: "Phan tich sau, so lieu chinh xac, co insight doc dao", minScore: 25, maxScore: 30 },
          { label: "Tot", description: "Phan tich day du, so lieu hop ly", minScore: 20, maxScore: 24 },
          { label: "Dat", description: "Co phan tich nhung con thieu so lieu", minScore: 15, maxScore: 19 },
          { label: "Chua dat", description: "Thieu phan tich hoac so lieu sai", minScore: 0, maxScore: 14 },
        ],
      },
      {
        id: "RC002", name: "Giai phap & De xuat", description: "Chat luong cac giai phap va de xuat cai tien", maxScore: 25, weight: 25,
        levels: [
          { label: "Xuat sac", description: "Giai phap sang tao, kha thi, co ROI du kien", minScore: 21, maxScore: 25 },
          { label: "Tot", description: "Giai phap hop ly va kha thi", minScore: 16, maxScore: 20 },
          { label: "Dat", description: "Co de xuat nhung chua cu the", minScore: 10, maxScore: 15 },
          { label: "Chua dat", description: "Khong co giai phap hoac khong kha thi", minScore: 0, maxScore: 9 },
        ],
      },
      {
        id: "RC003", name: "Trinh bay & Cau truc", description: "Bo cuc bai viet, trinh bay logic, ngu phap", maxScore: 25, weight: 25,
        levels: [
          { label: "Xuat sac", description: "Trinh bay chuyen nghiep, logic chat che", minScore: 21, maxScore: 25 },
          { label: "Tot", description: "Trinh bay ro rang, co cau truc", minScore: 16, maxScore: 20 },
          { label: "Dat", description: "Trinh bay duoc nhung con lon xon", minScore: 10, maxScore: 15 },
          { label: "Chua dat", description: "Trinh bay kem, khong co cau truc", minScore: 0, maxScore: 9 },
        ],
      },
      {
        id: "RC004", name: "Ung dung Thuc te", description: "Kha nang lien he voi thuc te cua Geleximco", maxScore: 20, weight: 20,
        levels: [
          { label: "Xuat sac", description: "Lien he sat thuc te, co vi du cu the tu Geleximco", minScore: 17, maxScore: 20 },
          { label: "Tot", description: "Co lien he thuc te hop ly", minScore: 13, maxScore: 16 },
          { label: "Dat", description: "It lien he thuc te", minScore: 8, maxScore: 12 },
          { label: "Chua dat", description: "Khong co lien he thuc te", minScore: 0, maxScore: 7 },
        ],
      },
    ],
  },
  {
    id: "RB002",
    name: "Rubric Case Study Lanh dao",
    description: "Danh gia bai phan tich case study ve ky nang lanh dao va quan tri trong boi canh doanh nghiep.",
    courseId: "C001",
    courseName: "Ky nang Lanh dao cho Quan ly Cap trung",
    totalMaxScore: 100,
    createdBy: "TS. Nguyen Van Hung",
    createdAt: "2025-11-15",
    usageCount: 12,
    isShared: false,
    criteria: [
      {
        id: "RC005", name: "Nhan dien Van de", description: "Kha nang xac dinh van de cot loi trong case study", maxScore: 25, weight: 25,
        levels: [
          { label: "Xuat sac", description: "Xac dinh chinh xac, phan tich nguyen nhan goc re", minScore: 21, maxScore: 25 },
          { label: "Tot", description: "Xac dinh dung van de chinh", minScore: 16, maxScore: 20 },
          { label: "Dat", description: "Nhan dien van de nhung chua sau", minScore: 10, maxScore: 15 },
          { label: "Chua dat", description: "Khong xac dinh duoc van de", minScore: 0, maxScore: 9 },
        ],
      },
      {
        id: "RC006", name: "Ap dung Ly thuyet", description: "Kha nang ap dung mo hinh lanh dao vao phan tich", maxScore: 25, weight: 25,
        levels: [
          { label: "Xuat sac", description: "Ap dung nhieu mo hinh, so sanh hieu qua", minScore: 21, maxScore: 25 },
          { label: "Tot", description: "Ap dung dung mo hinh phu hop", minScore: 16, maxScore: 20 },
          { label: "Dat", description: "Co de cap ly thuyet nhung chua sau", minScore: 10, maxScore: 15 },
          { label: "Chua dat", description: "Khong ap dung ly thuyet", minScore: 0, maxScore: 9 },
        ],
      },
      {
        id: "RC007", name: "Giai phap & Khuyen nghi", description: "Chat luong giai phap de xuat", maxScore: 30, weight: 30,
        levels: [
          { label: "Xuat sac", description: "Giai phap toan dien, kha thi, co lo trinh", minScore: 25, maxScore: 30 },
          { label: "Tot", description: "Giai phap tot va kha thi", minScore: 20, maxScore: 24 },
          { label: "Dat", description: "Co giai phap nhung chua day du", minScore: 12, maxScore: 19 },
          { label: "Chua dat", description: "Khong co giai phap cu the", minScore: 0, maxScore: 11 },
        ],
      },
      {
        id: "RC008", name: "Tu duy Phan bien", description: "Kha nang phan bien, danh gia da chieu", maxScore: 20, weight: 20,
        levels: [
          { label: "Xuat sac", description: "Tu duy sac ben, nhieu goc nhin, logic chat che", minScore: 17, maxScore: 20 },
          { label: "Tot", description: "Co tu duy phan bien tot", minScore: 13, maxScore: 16 },
          { label: "Dat", description: "Tu duy phan bien con han che", minScore: 8, maxScore: 12 },
          { label: "Chua dat", description: "Thieu tu duy phan bien", minScore: 0, maxScore: 7 },
        ],
      },
    ],
  },
  {
    id: "RB003",
    name: "Rubric Bao cao Tai chinh",
    description: "Danh gia bai phan tich bao cao tai chinh doanh nghiep.",
    courseId: "C003",
    courseName: "Phan tich Tai chinh Doanh nghiep",
    totalMaxScore: 100,
    createdBy: "ThS. Le Thi Thu Ha",
    createdAt: "2025-10-20",
    usageCount: 8,
    isShared: true,
    criteria: [
      {
        id: "RC009", name: "Do chinh xac So lieu", description: "Tinh chinh xac cua cac con so va tinh toan", maxScore: 30, weight: 30,
        levels: [
          { label: "Xuat sac", description: "So lieu chinh xac 100%, tinh toan dung", minScore: 25, maxScore: 30 },
          { label: "Tot", description: "Co it sai sot nho", minScore: 20, maxScore: 24 },
          { label: "Dat", description: "Co mot so sai sot", minScore: 15, maxScore: 19 },
          { label: "Chua dat", description: "Nhieu sai sot nghiem trong", minScore: 0, maxScore: 14 },
        ],
      },
      {
        id: "RC010", name: "Phan tich & Dien giai", description: "Kha nang dien giai va rut ra ket luan", maxScore: 30, weight: 30,
        levels: [
          { label: "Xuat sac", description: "Dien giai sau sac, co insight gia tri", minScore: 25, maxScore: 30 },
          { label: "Tot", description: "Dien giai dung va hop ly", minScore: 20, maxScore: 24 },
          { label: "Dat", description: "Dien giai co ban", minScore: 15, maxScore: 19 },
          { label: "Chua dat", description: "Khong dien giai duoc", minScore: 0, maxScore: 14 },
        ],
      },
      {
        id: "RC011", name: "Khuyen nghi Dau tu", description: "Chat luong khuyen nghi cho nha dau tu", maxScore: 20, weight: 20,
        levels: [
          { label: "Xuat sac", description: "Khuyen nghi cu the, co co so, co dinh luong", minScore: 17, maxScore: 20 },
          { label: "Tot", description: "Khuyen nghi hop ly", minScore: 13, maxScore: 16 },
          { label: "Dat", description: "Co khuyen nghi nhung chung chung", minScore: 8, maxScore: 12 },
          { label: "Chua dat", description: "Khong co khuyen nghi", minScore: 0, maxScore: 7 },
        ],
      },
      {
        id: "RC012", name: "Hinh thuc & Trinh bay", description: "Chat luong trinh bay va dinh dang bao cao", maxScore: 20, weight: 20,
        levels: [
          { label: "Xuat sac", description: "Trinh bay chuyen nghiep, bang bieu dep", minScore: 17, maxScore: 20 },
          { label: "Tot", description: "Trinh bay ro rang, co cau truc", minScore: 13, maxScore: 16 },
          { label: "Dat", description: "Trinh bay duoc nhung chua dep", minScore: 8, maxScore: 12 },
          { label: "Chua dat", description: "Trinh bay kem", minScore: 0, maxScore: 7 },
        ],
      },
    ],
  },
  {
    id: "RB004",
    name: "Rubric Du an (Project)",
    description: "Danh gia bai tap du an lon nhu WBS, ke hoach quan ly.",
    courseId: "C005",
    courseName: "Quan ly Du an theo chuan PMI",
    totalMaxScore: 100,
    createdBy: "PMP. Hoang Dinh Nam",
    createdAt: "2025-11-01",
    usageCount: 6,
    isShared: false,
    criteria: [
      {
        id: "RC013", name: "Pham vi & WBS", description: "Chat luong phan tich pham vi va WBS", maxScore: 25, weight: 25,
        levels: [
          { label: "Xuat sac", description: "WBS chi tiet, day du cac work package", minScore: 21, maxScore: 25 },
          { label: "Tot", description: "WBS tot, bao phu cac hang muc chinh", minScore: 16, maxScore: 20 },
          { label: "Dat", description: "Co WBS nhung chua day du", minScore: 10, maxScore: 15 },
          { label: "Chua dat", description: "Thieu WBS hoac sai cau truc", minScore: 0, maxScore: 9 },
        ],
      },
      {
        id: "RC014", name: "Tien do & Nguon luc", description: "Lap ke hoach tien do va phan bo nguon luc", maxScore: 25, weight: 25,
        levels: [
          { label: "Xuat sac", description: "Gantt chart chinh xac, nguon luc toi uu", minScore: 21, maxScore: 25 },
          { label: "Tot", description: "Ke hoach hop ly", minScore: 16, maxScore: 20 },
          { label: "Dat", description: "Co ke hoach nhung chua thuc te", minScore: 10, maxScore: 15 },
          { label: "Chua dat", description: "Khong co ke hoach", minScore: 0, maxScore: 9 },
        ],
      },
      {
        id: "RC015", name: "Quan ly Rui ro", description: "Nhan dien va ke hoach xu ly rui ro", maxScore: 25, weight: 25,
        levels: [
          { label: "Xuat sac", description: "Ma tran rui ro day du, ke hoach ung pho chi tiet", minScore: 21, maxScore: 25 },
          { label: "Tot", description: "Nhan dien tot cac rui ro chinh", minScore: 16, maxScore: 20 },
          { label: "Dat", description: "Co de cap rui ro nhung chua day du", minScore: 10, maxScore: 15 },
          { label: "Chua dat", description: "Khong phan tich rui ro", minScore: 0, maxScore: 9 },
        ],
      },
      {
        id: "RC016", name: "Tinh Thuc te & Kha thi", description: "Muc do thuc te va kha thi khi ap dung tai Geleximco", maxScore: 25, weight: 25,
        levels: [
          { label: "Xuat sac", description: "Rat thuc te, co the ap dung ngay", minScore: 21, maxScore: 25 },
          { label: "Tot", description: "Kha thi voi dieu chinh nho", minScore: 16, maxScore: 20 },
          { label: "Dat", description: "Can nhieu dieu chinh", minScore: 10, maxScore: 15 },
          { label: "Chua dat", description: "Khong thuc te", minScore: 0, maxScore: 9 },
        ],
      },
    ],
  },
  {
    id: "RB005",
    name: "Rubric Tong quat (General)",
    description: "Rubric danh gia chung cho cac bai tap khong co rubric rieng.",
    courseId: "",
    courseName: "Ap dung chung",
    totalMaxScore: 100,
    createdBy: "Ban Dao tao",
    createdAt: "2025-09-01",
    usageCount: 34,
    isShared: true,
    criteria: [
      {
        id: "RC017", name: "Noi dung & Kien thuc", description: "Do chinh xac va chieu sau cua kien thuc", maxScore: 35, weight: 35,
        levels: [
          { label: "Xuat sac", description: "Kien thuc vung, phan tich sau", minScore: 30, maxScore: 35 },
          { label: "Tot", description: "Kien thuc tot, co phan tich", minScore: 24, maxScore: 29 },
          { label: "Dat", description: "Kien thuc co ban", minScore: 18, maxScore: 23 },
          { label: "Chua dat", description: "Thieu kien thuc", minScore: 0, maxScore: 17 },
        ],
      },
      {
        id: "RC018", name: "Tu duy & Phan tich", description: "Kha nang tu duy logic va phan tich van de", maxScore: 25, weight: 25,
        levels: [
          { label: "Xuat sac", description: "Tu duy sac ben, phan tich da chieu", minScore: 21, maxScore: 25 },
          { label: "Tot", description: "Tu duy tot, logic", minScore: 16, maxScore: 20 },
          { label: "Dat", description: "Tu duy co ban", minScore: 10, maxScore: 15 },
          { label: "Chua dat", description: "Thieu tu duy phan tich", minScore: 0, maxScore: 9 },
        ],
      },
      {
        id: "RC019", name: "Trinh bay", description: "Chat luong trinh bay, cau truc, ngu phap", maxScore: 20, weight: 20,
        levels: [
          { label: "Xuat sac", description: "Trinh bay chuyen nghiep", minScore: 17, maxScore: 20 },
          { label: "Tot", description: "Trinh bay ro rang", minScore: 13, maxScore: 16 },
          { label: "Dat", description: "Trinh bay duoc", minScore: 8, maxScore: 12 },
          { label: "Chua dat", description: "Trinh bay kem", minScore: 0, maxScore: 7 },
        ],
      },
      {
        id: "RC020", name: "Ung dung & Sang tao", description: "Kha nang ung dung vao thuc te va sang tao", maxScore: 20, weight: 20,
        levels: [
          { label: "Xuat sac", description: "Sang tao, ung dung tot", minScore: 17, maxScore: 20 },
          { label: "Tot", description: "Co ung dung thuc te", minScore: 13, maxScore: 16 },
          { label: "Dat", description: "It ung dung", minScore: 8, maxScore: 12 },
          { label: "Chua dat", description: "Khong ung dung", minScore: 0, maxScore: 7 },
        ],
      },
    ],
  },
];

// ─── MOCK GRADING HISTORY (~60 entries) ───
function generateHistory(): GradeHistoryEntry[] {
  const entries: GradeHistoryEntry[] = [];
  const actions: GradeAction[] = ["graded", "graded", "graded", "revised", "graded", "resubmit_request", "graded", "auto_graded", "graded", "appeal_filed", "graded", "override"];
  const graders = ["ThS. Pham Anh Tuan", "TS. Nguyen Van Hung", "ThS. Le Thi Thu Ha", "PMP. Hoang Dinh Nam", "KS. Tran Minh Duc", "ThS. Vu Minh Chau"];
  const reasons = [
    "Cham diem lan dau",
    "Sua diem sau khi xem lai bai ky hon",
    "Hoc vien yeu cau xem lai",
    "Yeu cau nop lai vi chua dat",
    "AI tu dong cham diem",
    "Admin override theo chinh sach",
    "Cap nhat diem sau khieu nai",
    "Cham lai sau khi hoc vien bo sung",
  ];

  for (let i = 0; i < 60; i++) {
    const sub = MOCK_SUBMISSIONS[i % MOCK_SUBMISSIONS.length];
    const action = actions[i % actions.length];
    const dayOffset = 60 - i;
    const date = new Date(2026, 2, 12);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];
    const oldScore = action === "revised" || action === "override" ? Math.floor(40 + Math.random() * 30) : null;
    const newScore = action === "resubmit_request" ? null : Math.floor(50 + Math.random() * 45);

    entries.push({
      id: `GH${String(i + 1).padStart(3, "0")}`,
      submissionId: sub.id,
      studentName: sub.studentName,
      courseName: sub.courseName,
      assignmentTitle: sub.assignmentTitle,
      action,
      performedBy: action === "override" ? "Nguyen Van Minh (Admin)" : action === "auto_graded" ? "AI System" : graders[i % graders.length],
      performedByRole: action === "override" ? "admin" : action === "auto_graded" ? "system" : "instructor",
      timestamp: `${dateStr} ${String(8 + (i % 10)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
      oldScore,
      newScore: newScore ? Math.min(100, newScore) : null,
      maxScore: 100,
      reason: reasons[i % reasons.length],
      feedback: i % 3 === 0 ? "Bai lam tot, can cai thien them phan ket luan." : "",
    });
  }
  return entries;
}

export const MOCK_GRADING_HISTORY = generateHistory();

// ─── MOCK GRADE APPEALS (8) ───
export const MOCK_APPEALS: GradeAppeal[] = [
  {
    id: "GA001", submissionId: "GS019", studentId: "E119", studentName: "Ngo Bich Ngoc",
    subsidiary: "Geleximco Thuong mai & XNK", courseId: "C004", courseName: "Marketing so & Truyen thong Thuong hieu",
    assignmentTitle: "Phan tich chien dich Facebook Ads", currentScore: 58, maxScore: 100,
    reason: "Em da phan tich day du ROAS va CPA nhung bi tru diem nhieu o phan ket luan. Em xin duoc xem lai.",
    evidence: "Em da dinh kem bang tinh Excel chi tiet voi so lieu tu Facebook Ads Manager.",
    status: "pending", filedAt: "2026-03-08 14:20", resolvedAt: null, resolvedBy: null, newScore: null,
    resolution: "", instructorName: "ThS. Pham Anh Tuan",
  },
  {
    id: "GA002", submissionId: "GS005", studentId: "E104", studentName: "Hoang Thu Trang",
    subsidiary: "Tap doan Geleximco", courseId: "C001", courseName: "Ky nang Lanh dao cho Quan ly Cap trung",
    assignmentTitle: "Case Study: Chien luoc lanh dao trong khung hoang", currentScore: 65, maxScore: 100,
    reason: "Bai cua em ap dung mo hinh Kotter 8 buoc nhung giang vien nhan xet la chua phu hop. Em muon giai thich lai.",
    evidence: "Em co tham khao bai bao cua HBR ve Kotter model trong boi canh VUCA.",
    status: "reviewing", filedAt: "2026-03-06 09:30", resolvedAt: null, resolvedBy: null, newScore: null,
    resolution: "", instructorName: "TS. Nguyen Van Hung",
  },
  {
    id: "GA003", submissionId: "GS011", studentId: "E110", studentName: "Le Minh Chau",
    subsidiary: "BDS Geleximco - KDT Duong Noi", courseId: "C003", courseName: "Phan tich Tai chinh Doanh nghiep",
    assignmentTitle: "Phan tich BCTC cua ABBank Q3/2025", currentScore: 52, maxScore: 100,
    reason: "Em su dung so lieu tu BCTC ban hanh chinh thuc nhung giang vien cho rang so lieu sai.",
    evidence: "Em da dinh kem scan BCTC goc tu website ABBank.",
    status: "resolved", filedAt: "2026-03-02 11:15", resolvedAt: "2026-03-05 16:40", resolvedBy: "ThS. Le Thi Thu Ha",
    newScore: 68, resolution: "Da xac minh so lieu chinh xac. Tang diem phan Du lieu +16. Giu nguyen phan Phan tich.",
    instructorName: "ThS. Le Thi Thu Ha",
  },
  {
    id: "GA004", submissionId: "GS015", studentId: "E114", studentName: "Vu Quang Huy",
    subsidiary: "BDS Geleximco - KDT An Khanh", courseId: "C004", courseName: "Marketing so & Truyen thong Thuong hieu",
    assignmentTitle: "Viet content cho Landing Page", currentScore: 48, maxScore: 100,
    reason: "Bai cua em bi danh gia thap vi thieu CTA nhung em da co 3 CTA trong bai.",
    evidence: "Em highlight 3 CTA trong file PDF dinh kem.",
    status: "resolved", filedAt: "2026-02-28 16:00", resolvedAt: "2026-03-03 10:20", resolvedBy: "ThS. Pham Anh Tuan",
    newScore: 48, resolution: "Da xem lai. 3 CTA co nhung deu la generic 'Lien he ngay'. Can CTA cu the hon voi uu dai/action ro rang.",
    instructorName: "ThS. Pham Anh Tuan",
  },
  {
    id: "GA005", submissionId: "GS022", studentId: "E121", studentName: "Tran Duc Anh",
    subsidiary: "BDS Geleximco - KDT An Khanh", courseId: "C005", courseName: "Quan ly Du an theo chuan PMI",
    assignmentTitle: "Lap WBS cho du an KDT 50ha", currentScore: 55, maxScore: 100,
    reason: "WBS cua em da duoc trung tam PMI chung nhan nhung giang vien cho diem thap.",
    evidence: "File chung nhan tu PMI Vietnam ve WBS template.",
    status: "rejected", filedAt: "2026-03-01 08:45", resolvedAt: "2026-03-04 14:30", resolvedBy: "PMP. Hoang Dinh Nam",
    newScore: null, resolution: "WBS template chung khong the ap dung truc tiep cho du an BDS 50ha. Can customize theo dac thu du an.",
    instructorName: "PMP. Hoang Dinh Nam",
  },
  {
    id: "GA006", submissionId: "GS028", studentId: "E127", studentName: "Pham Hong Son",
    subsidiary: "BDS Geleximco - KDT Le Trong Tan", courseId: "C001", courseName: "Ky nang Lanh dao cho Quan ly Cap trung",
    assignmentTitle: "Bai tap: Mo hinh Servant Leadership", currentScore: 62, maxScore: 100,
    reason: "Em xin khieu nai vi bai cua em va ban cung nhom tuong tu nhung ban duoc 82 diem.",
    evidence: "So sanh 2 bai lam dinh kem.",
    status: "pending", filedAt: "2026-03-09 10:00", resolvedAt: null, resolvedBy: null, newScore: null,
    resolution: "", instructorName: "TS. Nguyen Van Hung",
  },
  {
    id: "GA007", submissionId: "GS033", studentId: "E132", studentName: "Dang Van Long",
    subsidiary: "Xi mang Thang Long", courseId: "C002", courseName: "An toan Lao dong trong Xay dung & Khai khoang",
    assignmentTitle: "Bai kiem tra An toan lao dong", currentScore: 57, maxScore: 100,
    reason: "Cau 15 va cau 22 em chon dap an dung nhung he thong tinh sai.",
    evidence: "Screenshot dap an cua em va dap an dung tu tai lieu.",
    status: "reviewing", filedAt: "2026-03-07 13:30", resolvedAt: null, resolvedBy: null, newScore: null,
    resolution: "", instructorName: "KS. Tran Minh Duc",
  },
  {
    id: "GA008", submissionId: "GS038", studentId: "E137", studentName: "Nguyen Thi Ha",
    subsidiary: "Ngan hang TMCP An Binh (ABBank)", courseId: "C003", courseName: "Phan tich Tai chinh Doanh nghiep",
    assignmentTitle: "Bai kiem tra: Dinh gia doanh nghiep (DCF)", currentScore: 45, maxScore: 100,
    reason: "Em bi tinh sai o phan WACC do loi lam tron so. Xin xem lai.",
    evidence: "File Excel goc voi cong thuc WACC chinh xac.",
    status: "pending", filedAt: "2026-03-10 09:15", resolvedAt: null, resolvedBy: null, newScore: null,
    resolution: "", instructorName: "ThS. Le Thi Thu Ha",
  },
];

// ─── MOCK SUBSIDIARY STATS (14) ───
export const MOCK_SUBSIDIARY_STATS: SubsidiaryGradeStats[] = SUBSIDIARIES.map((sub, i) => ({
  subsidiary: sub,
  totalGraded: 50 + Math.floor(Math.random() * 150),
  avgScore: Math.floor(65 + Math.random() * 25),
  passRate: Math.floor(70 + Math.random() * 25),
  pendingCount: Math.floor(2 + Math.random() * 20),
  totalStudents: Math.floor(80 + Math.random() * 600),
  topCourse: GRADING_COURSES[i % GRADING_COURSES.length].name,
  weakestCourse: GRADING_COURSES[(i + 3) % GRADING_COURSES.length].name,
  monthlyTrend: Array.from({ length: 6 }, () => Math.floor(60 + Math.random() * 30)),
}));

// ─── MOCK INSTRUCTOR METRICS (6) ───
export const MOCK_INSTRUCTOR_METRICS: InstructorMetric[] = [
  { id: "INS01", name: "ThS. Pham Anh Tuan", subsidiary: "BDS Geleximco - KDT An Khanh", department: "Ban Marketing BDS", initials: "PT", totalGraded: 187, pendingCount: 12, avgGradingTimeMinutes: 8, avgScore: 74.5, consistencyScore: 88, avgFeedbackLength: 120, coursesAssigned: 3, lastGradedAt: "2026-03-11 16:30", rating: 4.7 },
  { id: "INS02", name: "TS. Nguyen Van Hung", subsidiary: "Tap doan Geleximco", department: "Ban Giam doc Tap doan", initials: "NH", totalGraded: 142, pendingCount: 5, avgGradingTimeMinutes: 12, avgScore: 78.2, consistencyScore: 92, avgFeedbackLength: 185, coursesAssigned: 2, lastGradedAt: "2026-03-11 14:15", rating: 4.9 },
  { id: "INS03", name: "ThS. Le Thi Thu Ha", subsidiary: "Ngan hang TMCP An Binh (ABBank)", department: "Khoi Tin dung", initials: "TH", totalGraded: 96, pendingCount: 18, avgGradingTimeMinutes: 15, avgScore: 71.8, consistencyScore: 85, avgFeedbackLength: 95, coursesAssigned: 2, lastGradedAt: "2026-03-10 11:00", rating: 4.5 },
  { id: "INS04", name: "PMP. Hoang Dinh Nam", subsidiary: "BDS Geleximco - KDT Le Trong Tan", department: "Ban Quan ly Du an BDS", initials: "HN", totalGraded: 78, pendingCount: 8, avgGradingTimeMinutes: 18, avgScore: 69.3, consistencyScore: 79, avgFeedbackLength: 210, coursesAssigned: 2, lastGradedAt: "2026-03-09 17:45", rating: 4.6 },
  { id: "INS05", name: "KS. Tran Minh Duc", subsidiary: "Khoang san Geleximco", department: "Ban An toan Mo & Lao dong", initials: "MD", totalGraded: 234, pendingCount: 3, avgGradingTimeMinutes: 5, avgScore: 76.1, consistencyScore: 91, avgFeedbackLength: 65, coursesAssigned: 1, lastGradedAt: "2026-03-11 09:00", rating: 4.4 },
  { id: "INS06", name: "ThS. Vu Minh Chau", subsidiary: "Tap doan Geleximco", department: "Ban Nhan su Tap doan", initials: "MC", totalGraded: 165, pendingCount: 7, avgGradingTimeMinutes: 10, avgScore: 80.4, consistencyScore: 86, avgFeedbackLength: 140, coursesAssigned: 2, lastGradedAt: "2026-03-11 15:20", rating: 4.8 },
];

// ─── MOCK GRADEBOOK (25 students × 5 assignments for C004) ───
function generateGradebook(): GradebookEntry[] {
  const assignments = GRADING_ASSIGNMENTS.filter(a => a.courseId === "C004").slice(0, 5);
  const entries: GradebookEntry[] = [];

  for (let i = 0; i < 25; i++) {
    const name = genName(i + 50);
    const initials = genInitials(name);
    const scores: GradebookEntry["scores"] = {};
    let totalScore = 0;
    let scoredCount = 0;

    assignments.forEach((a, j) => {
      const hasScore = Math.random() > 0.15; // 85% have scores
      const score = hasScore ? Math.floor(40 + Math.random() * 58) : null;
      const clampedScore = score !== null ? Math.min(100, score) : null;
      scores[a.id] = {
        score: clampedScore,
        maxScore: a.maxScore,
        status: clampedScore !== null ? "graded" : (j === assignments.length - 1 ? "pending" : "graded"),
        gradedAt: clampedScore !== null ? `2026-03-${String(5 + j * 3).padStart(2, "0")}` : null,
      };
      if (clampedScore !== null) {
        totalScore += clampedScore;
        scoredCount++;
      }
    });

    const avg = scoredCount > 0 ? Math.round((totalScore / scoredCount) * 10) / 10 : null;

    entries.push({
      studentId: `E${String(200 + i).padStart(3, "0")}`,
      studentName: name,
      subsidiary: SUBSIDIARIES[i % SUBSIDIARIES.length],
      department: DEPARTMENTS[(i + 5) % DEPARTMENTS.length],
      initials,
      scores,
      average: avg,
      rank: null,
    });
  }

  // Calculate ranks
  const ranked = entries.filter(e => e.average !== null).sort((a, b) => (b.average || 0) - (a.average || 0));
  ranked.forEach((e, i) => { e.rank = i + 1; });

  return entries;
}

export const MOCK_GRADEBOOK = generateGradebook();

// ─── Default Grading Policy ───
export const DEFAULT_GRADING_POLICY: GradingPolicy = {
  scale: "100",
  passingThreshold: 60,
  weights: { assignment: 30, midterm: 30, final: 40 },
  autoLockDays: 14,
  requireApproval: false,
};

// ─── Feedback Templates ───
export const FEEDBACK_TEMPLATES = [
  "Bai lam tot, the hien su hieu biet sau ve chu de.",
  "Can cai thien phan ket luan va de xuat giai phap cu the hon.",
  "So lieu phan tich chinh xac, trinh bay ro rang. Diem tot.",
  "Chua dat yeu cau toi thieu. Can bo sung them noi dung va so lieu minh chung.",
  "Co tiem nang tot. Can tap trung hon vao viec lien he ly thuyet voi thuc te.",
  "Trinh bay chuyen nghiep nhung noi dung con chung chung. Can di sau hon.",
  "Bai lam xuat sac, vuot tren mong doi. Tiep tuc phat huy!",
  "Can xem lai phan phan tich SWOT, co mot so diem chua chinh xac.",
  "Giai phap de xuat kha thi va co tinh ung dung cao cho Geleximco.",
  "Can chu y hon ve ngu phap, chinh ta va cach dien dat chuyen nghiep.",
];

// ─── Helper Functions ───
export function getSubmissionsByStatus(status?: SubmissionStatus): GradingSubmission[] {
  if (!status) return MOCK_SUBMISSIONS;
  return MOCK_SUBMISSIONS.filter(s => s.status === status);
}

export function getSubmissionsByCourse(courseId: string): GradingSubmission[] {
  return MOCK_SUBMISSIONS.filter(s => s.courseId === courseId);
}

export function getPendingCount(): number {
  return MOCK_SUBMISSIONS.filter(s => s.status === "pending" || s.status === "late").length;
}

export function getOverdueCount(): number {
  return MOCK_SUBMISSIONS.filter(s => s.isOverdue).length;
}

export function getGradedTodayCount(): number {
  return MOCK_SUBMISSIONS.filter(s => s.status === "graded" && s.gradedAt?.startsWith("2026-03-12")).length;
}

export function getGradebookAssignments() {
  return GRADING_ASSIGNMENTS.filter(a => a.courseId === "C004").slice(0, 5);
}

export function getAppealsByStatus(status?: AppealStatus): GradeAppeal[] {
  if (!status) return MOCK_APPEALS;
  return MOCK_APPEALS.filter(a => a.status === status);
}