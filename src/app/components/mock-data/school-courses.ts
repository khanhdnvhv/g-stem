import type { StemProgram, StemPackageTier } from "./types";
import { tenantsByType } from "./tenants";

export interface SchoolCourse {
  id: string;
  schoolId: string;
  programCode: StemProgram;
  programName: string;
  packageTier: StemPackageTier;
  subject: string;
  grade: number;
  totalLessons: number;
  completedLessons: number;
  purchaseDate: string;
  expiryDate: string;
  licenseSeats: number;
  seatsUsed: number;
  assignedClasses: string[];
  status: "active" | "expired" | "suspended";
}

const school = tenantsByType.school[0];

export const schoolCourses: SchoolCourse[] = [
  {
    id: "SC-001",
    schoolId: school.id,
    programCode: "CT1",
    programName: "STEM Tích hợp Khoa học Tự nhiên",
    packageTier: "advanced",
    subject: "Khoa học Tự nhiên",
    grade: 6,
    totalLessons: 35,
    completedLessons: 28,
    purchaseDate: "2025-09-01",
    expiryDate: "2026-08-31",
    licenseSeats: 160,
    seatsUsed: 148,
    assignedClasses: [`${school.id}-C01`, `${school.id}-C02`, `${school.id}-C03`, `${school.id}-C04`],
    status: "active",
  },
  {
    id: "SC-002",
    schoolId: school.id,
    programCode: "CT2",
    programName: "Lập trình & Tư duy Thuật toán",
    packageTier: "advanced",
    subject: "Tin học",
    grade: 7,
    totalLessons: 30,
    completedLessons: 22,
    purchaseDate: "2025-09-01",
    expiryDate: "2026-08-31",
    licenseSeats: 150,
    seatsUsed: 142,
    assignedClasses: [`${school.id}-C05`, `${school.id}-C06`, `${school.id}-C07`, `${school.id}-C08`],
    status: "active",
  },
  {
    id: "SC-003",
    schoolId: school.id,
    programCode: "CT3",
    programName: "Robotics & Tự động hóa",
    packageTier: "advanced",
    subject: "Công nghệ",
    grade: 8,
    totalLessons: 25,
    completedLessons: 18,
    purchaseDate: "2025-09-01",
    expiryDate: "2026-08-31",
    licenseSeats: 120,
    seatsUsed: 108,
    assignedClasses: [`${school.id}-C09`, `${school.id}-C10`, `${school.id}-C11`],
    status: "active",
  },
  {
    id: "SC-004",
    schoolId: school.id,
    programCode: "CT4",
    programName: "IoT & Điện tử Ứng dụng",
    packageTier: "basic",
    subject: "Vật lý - Công nghệ",
    grade: 8,
    totalLessons: 20,
    completedLessons: 12,
    purchaseDate: "2025-09-01",
    expiryDate: "2026-08-31",
    licenseSeats: 80,
    seatsUsed: 72,
    assignedClasses: [`${school.id}-C09`, `${school.id}-C10`],
    status: "active",
  },
  {
    id: "SC-005",
    schoolId: school.id,
    programCode: "CT5",
    programName: "AI & Khoa học Dữ liệu",
    packageTier: "advanced",
    subject: "Toán - Tin học",
    grade: 9,
    totalLessons: 18,
    completedLessons: 10,
    purchaseDate: "2025-09-01",
    expiryDate: "2026-08-31",
    licenseSeats: 100,
    seatsUsed: 84,
    assignedClasses: [`${school.id}-C12`, `${school.id}-C13`, `${school.id}-C14`],
    status: "active",
  },
  {
    id: "SC-006",
    schoolId: school.id,
    programCode: "CT1",
    programName: "STEM Tích hợp Khoa học Tự nhiên",
    packageTier: "minimum",
    subject: "Khoa học Tự nhiên",
    grade: 7,
    totalLessons: 20,
    completedLessons: 20,
    purchaseDate: "2024-09-01",
    expiryDate: "2025-08-31",
    licenseSeats: 80,
    seatsUsed: 80,
    assignedClasses: [],
    status: "expired",
  },
];

export function coursesBySchool(schoolId: string): SchoolCourse[] {
  return schoolCourses.filter((c) => c.schoolId === schoolId);
}
