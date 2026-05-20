import type { StemPackageTier } from "./types";
import { tenantsByType } from "./tenants";

export interface SchoolProfileData {
  id: string;
  officialName: string;
  shortName: string;
  moetCode: string;
  type: "public" | "private" | "semi-public";
  level: "elementary" | "middle" | "high" | "multi";
  gradeRange: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  deputyPrincipalName: string;
  stemCoordinatorName: string;
  stemCoordinatorPhone: string;
  foundedYear: number;
  studentCount: number;
  teacherCount: number;
  classCount: number;
  stemClassroomCount: number;
  contractStartDate: string;
  contractEndDate: string;
  packageTier: StemPackageTier;
  licenseQuota: number;
  licenseUsed: number;
  accreditation: string;
  achievements: string[];
  logoUrl?: string;
}

const school = tenantsByType.school[0];

export const schoolProfileData: SchoolProfileData = {
  id: school.id,
  officialName: "Trường Trung học Cơ sở Nguyễn Du",
  shortName: "THCS Nguyễn Du",
  moetCode: "79000001",
  type: "public",
  level: "middle",
  gradeRange: "6-9",
  address: "48 Lê Lợi, Phường 2",
  ward: "Phường 2",
  district: "Quận 3",
  province: "TP.HCM",
  principalName: "ThS. Nguyễn Thị Bích Phương",
  principalEmail: "hieupho@thcs-nguyendu.edu.vn",
  principalPhone: "0901 234 567",
  deputyPrincipalName: "TS. Trần Minh Khoa",
  stemCoordinatorName: "GV. Phạm Anh Tuấn",
  stemCoordinatorPhone: "0912 345 678",
  foundedYear: 1975,
  studentCount: 1248,
  teacherCount: 68,
  classCount: 32,
  stemClassroomCount: 4,
  contractStartDate: "2025-09-01",
  contractEndDate: "2028-08-31",
  packageTier: "advanced",
  licenseQuota: 1500,
  licenseUsed: 1312,
  accreditation: "Kiểm định chất lượng cấp độ 3 (2024)",
  achievements: [
    "Trường chuẩn Quốc gia mức độ 1",
    "Giải Nhất Robotic cấp Quận 2025",
    "Top 5 trường đổi mới sáng tạo TP.HCM 2024",
    "Đơn vị tiên phong triển khai STEM tích hợp",
  ],
};
