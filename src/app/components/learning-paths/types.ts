// ============================================
// LEARNING PATHS MODULE - Types & Interfaces
// ============================================

export interface PathMilestone {
  id: string;
  title: string;
  description: string;
  courseIds: string[];
  order: number;
  requiredCompletionRate: number; // % to unlock next milestone
}

export interface LearningPathFull {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: "Cơ bản" | "Trung cấp" | "Nâng cao" | "Chuyên gia";
  status: "active" | "draft" | "archived";
  mandatory: boolean;
  department: string;
  subsidiary: string;
  targetPositions: string[];
  milestones: PathMilestone[];
  courseIds: string[];
  totalDuration: string;
  totalCourses: number;
  enrolledCount: number;
  completionRate: number;
  avgRating: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  tags: string[];
  prerequisites: string[]; // other path IDs
  certificateOnCompletion: boolean;
  estimatedWeeks: number;
}

export interface PathEnrollment {
  id: string;
  pathId: string;
  userId: string;
  userName: string;
  userDepartment: string;
  userSubsidiary: string;
  enrolledDate: string;
  deadline?: string;
  progress: number; // 0-100
  completedCourses: number;
  totalCourses: number;
  currentCourseId: string;
  currentMilestoneId: string;
  status: "in_progress" | "completed" | "overdue" | "not_started";
  lastAccessDate: string;
  totalHoursSpent: number;
  certificateIssued: boolean;
}

export interface PathAssignment {
  id: string;
  pathId: string;
  pathTitle: string;
  assignedTo: {
    type: "department" | "subsidiary" | "individual" | "position";
    name: string;
    count: number;
  };
  assignedBy: string;
  assignedDate: string;
  deadline: string;
  status: "active" | "completed" | "cancelled";
  enrolledCount: number;
  completedCount: number;
}

export interface PathTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  courseCount: number;
  estimatedWeeks: number;
  usageCount: number;
  rating: number;
  tags: string[];
  icon: string;
}

export interface PathAnalytics {
  pathId: string;
  monthlyEnrollments: { month: string; count: number }[];
  completionTrend: { month: string; rate: number }[];
  departmentBreakdown: { dept: string; enrolled: number; completed: number }[];
  avgCompletionDays: number;
  dropOffPoints: { courseTitle: string; dropRate: number }[];
}

export type AdminTab = "overview" | "list" | "builder" | "assignments" | "analytics" | "templates";
export type LearnerTab = "my-paths" | "explore" | "ai-recommend";
