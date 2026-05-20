import type { StemProgram, StemPackageTier } from "./types";
import { tenantsByType } from "./tenants";

export interface STEMRoom {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  capacity: number;
  area: number;
  floor: number;
  building: string;
  tier: StemPackageTier;
  status: "active" | "maintenance" | "inactive";
  equipmentCount: number;
  equipmentOkCount: number;
  lastMaintenanceDate: string;
  programs: StemProgram[];
  features: string[];
  description: string;
  image?: string;
}

const school = tenantsByType.school[0];

export const stemRooms: STEMRoom[] = [
  {
    id: "R-STEM-1",
    schoolId: school.id,
    name: "Phòng STEM 1",
    code: "P-STEM-01",
    capacity: 40,
    area: 72,
    floor: 2,
    building: "Nhà A",
    tier: "advanced",
    status: "active",
    equipmentCount: 24,
    equipmentOkCount: 22,
    lastMaintenanceDate: "2026-04-15",
    programs: ["CT1", "CT2", "CT3"],
    features: ["Máy tính bảng (24 bộ)", "Bảng tương tác thông minh", "Máy in 3D", "Bộ thí nghiệm Vật lý"],
    description: "Phòng STEM đa năng trang bị đầy đủ thiết bị công nghệ cao, phù hợp giảng dạy các chương trình CT1-CT3.",
  },
  {
    id: "R-STEM-2",
    schoolId: school.id,
    name: "Phòng STEM 2",
    code: "P-STEM-02",
    capacity: 35,
    area: 64,
    floor: 2,
    building: "Nhà A",
    tier: "basic",
    status: "active",
    equipmentCount: 18,
    equipmentOkCount: 18,
    lastMaintenanceDate: "2026-03-20",
    programs: ["CT2", "CT4"],
    features: ["Máy tính laptop (18 bộ)", "Máy chiếu", "Bộ kit điện tử cơ bản"],
    description: "Phòng học lập trình và điện tử ứng dụng với thiết bị đồng bộ, phù hợp CT2 và CT4.",
  },
  {
    id: "R-STEM-3",
    schoolId: school.id,
    name: "Phòng Robotic",
    code: "P-ROBOT",
    capacity: 30,
    area: 80,
    floor: 3,
    building: "Nhà B",
    tier: "advanced",
    status: "active",
    equipmentCount: 16,
    equipmentOkCount: 14,
    lastMaintenanceDate: "2026-05-01",
    programs: ["CT3", "CT5"],
    features: ["Robot LEGO Mindstorms (16 bộ)", "Arena thi đấu Robot", "Bảng tương tác", "Camera AI"],
    description: "Phòng chuyên biệt cho Robotics và AI, có arena chuẩn thi đấu cấp quốc gia.",
  },
  {
    id: "R-STEM-4",
    schoolId: school.id,
    name: "Phòng IoT & AI",
    code: "P-IOT",
    capacity: 28,
    area: 56,
    floor: 3,
    building: "Nhà B",
    tier: "advanced",
    status: "maintenance",
    equipmentCount: 20,
    equipmentOkCount: 15,
    lastMaintenanceDate: "2026-05-10",
    programs: ["CT4", "CT5"],
    features: ["Raspberry Pi (20 bộ)", "Cảm biến IoT", "Màn hình dashboard", "Server Edge AI"],
    description: "Phòng thực hành Internet of Things và AI ứng dụng. Đang bảo trì định kỳ.",
  },
];

export function roomsBySchool(schoolId: string): STEMRoom[] {
  return stemRooms.filter((r) => r.schoolId === schoolId);
}
