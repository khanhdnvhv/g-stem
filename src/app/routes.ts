import { createElement } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { AuthGuard } from "./components/AuthGuard";
import { Login } from "./components/Login";
import { NotFound } from "./components/NotFound";
import { ComingSoon } from "./components/stem/ComingSoon";

// === Component cũ dùng lại ===========================================
import { UserProfile } from "./components/UserProfile";
import { Settings } from "./components/Settings";
import { Notifications } from "./components/Notifications";
import { Messaging } from "./components/Messaging";
import { Announcements } from "./components/Announcements";
import { Dashboard as LegacyDashboard } from "./components/Dashboard";

// === Supplier — Phase 3 ==============================================
import { SupplierDashboard } from "./components/stem/supplier/SupplierDashboard";
import { STEMPackageCatalog } from "./components/stem/supplier/STEMPackageCatalog";
import { STEMPackageConfigurator } from "./components/stem/supplier/STEMPackageConfigurator";
import { STEMProgramManager } from "./components/stem/supplier/STEMProgramManager";
import { MediaAssetManager } from "./components/stem/supplier/MediaAssetManager";
import { STEMOrderManagement } from "./components/stem/supplier/STEMOrderManagement";
import { LicenseDistribution } from "./components/stem/supplier/LicenseDistribution";
import { SoftwareInstaller } from "./components/stem/supplier/SoftwareInstaller";
import { WarrantyFulfillment } from "./components/stem/supplier/WarrantyFulfillment";
import { SupplierRevenueDashboard } from "./components/stem/supplier/SupplierRevenueDashboard";
import { ContentAuthoringStudio } from "./components/stem/supplier/ContentAuthoringStudio";
import { ContentLibraryBank } from "./components/stem/supplier/ContentLibraryBank";
import { STEMExamEcosystem } from "./components/stem/supplier/STEMExamEcosystem";
import { TeacherTrainingProgram } from "./components/stem/supplier/TeacherTrainingProgram";
import { SchoolsDirectoryNCC } from "./components/stem/supplier/SchoolsDirectoryNCC";
import { DistributorNetwork } from "./components/stem/supplier/DistributorNetwork";
import { TeachingEffectivenessAnalytics } from "./components/stem/supplier/TeachingEffectivenessAnalytics";

// === Distributor — Phase 3 ===========================================
import { DistributorDashboard } from "./components/stem/distributor/DistributorDashboard";
import { DistributorOrderBoard } from "./components/stem/distributor/DistributorOrderBoard";
import { STEMContractManagement } from "./components/stem/distributor/STEMContractManagement";
import { VirtualInventory } from "./components/stem/distributor/VirtualInventory";
import { CommissionReconciliation } from "./components/stem/distributor/CommissionReconciliation";
import { RevenueReports } from "./components/stem/distributor/RevenueReports";
import { CRMCustomerManagement } from "./components/stem/distributor/CRMCustomerManagement";
import { CustomerCare } from "./components/stem/distributor/CustomerCare";
import { SalesApp } from "./components/stem/distributor/SalesApp";

// === School — Phase 4 ================================================
import { SchoolDashboard } from "./components/stem/school/SchoolDashboard";
import { SchoolPurchaseFlow } from "./components/stem/school/SchoolPurchaseFlow";
import { EquipmentInventory } from "./components/stem/school/EquipmentInventory";
import { WarrantyTicketing } from "./components/stem/school/WarrantyTicketing";
import { TeacherManagement } from "./components/stem/school/TeacherManagement";
import { StudentManagement } from "./components/stem/school/StudentManagement";
import { STEMSchedulePlanner } from "./components/stem/school/STEMSchedulePlanner";
import { SchoolLicensePanel } from "./components/stem/school/SchoolLicensePanel";
import { SchoolSTEMEffectivenessReport } from "./components/stem/school/SchoolSTEMEffectivenessReport";

// === Teacher — Phase 4 ===============================================
import { TeacherDashboard } from "./components/stem/teacher/TeacherDashboard";
import { STEMScheduleViewer } from "./components/stem/teacher/STEMScheduleViewer";
import { TeacherTrainingHub } from "./components/stem/teacher/TeacherTrainingHub";
import { TeacherResourceDownloader } from "./components/stem/teacher/TeacherResourceDownloader";
import { ClassroomEquipmentCheck } from "./components/stem/teacher/ClassroomEquipmentCheck";
import { StudentProgressTracker } from "./components/stem/teacher/StudentProgressTracker";
import { LessonPlanBuilder } from "./components/stem/teacher/LessonPlanBuilder";

// === Student — Phase 4 ===============================================
import { StudentHome } from "./components/stem/student/StudentHome";
import { StudentScheduleViewer } from "./components/stem/student/StudentScheduleViewer";
import { StudentLessonPlayer } from "./components/stem/student/StudentLessonPlayer";
import { STEMExamParticipation } from "./components/stem/student/STEMExamParticipation";
import { StudentAchievements } from "./components/stem/student/StudentAchievements";
import { StudentCertificates } from "./components/stem/student/StudentCertificates";

// === Authority — Phase 5 =============================================
import { RegionalEducationDashboard } from "./components/stem/authority/RegionalEducationDashboard";
import { SchoolDirectory } from "./components/stem/authority/SchoolDirectory";
import { EquipmentComplianceMonitor } from "./components/stem/authority/EquipmentComplianceMonitor";
import { ProcurementCostAnalytics } from "./components/stem/authority/ProcurementCostAnalytics";
import { NationalDataSync } from "./components/stem/authority/NationalDataSync";
import { CommonCatalogManager } from "./components/stem/authority/CommonCatalogManager";
import { MinistryReportExporter } from "./components/stem/authority/MinistryReportExporter";

// === AI-Buddy — Phase 7 ==============================================
import { AIBuddyPanel } from "./components/stem/ai/AIBuddyPanel";

// === Admin (System) — Phase 6 ========================================
import { AdminDashboard } from "./components/stem/admin/AdminDashboard";
import { TenantManagementAdmin } from "./components/stem/admin/TenantManagement";
import { TenantOnboarding } from "./components/stem/admin/TenantOnboarding";
import { LicenseMonitoring } from "./components/stem/admin/LicenseMonitoring";
import { DevPortal } from "./components/stem/admin/DevPortal";
import { DataLakeCenter } from "./components/stem/admin/DataLakeCenter";
import { SecurityConfig } from "./components/stem/admin/SecurityConfig";
import { PlatformConfig } from "./components/stem/admin/PlatformConfig";
import { SystemHealthMonitor } from "./components/stem/admin/SystemHealthMonitor";
import { AuditLogAdmin } from "./components/stem/admin/AuditLog";
import { CrossTenantAccessLog } from "./components/stem/admin/CrossTenantAccessLog";
import { UserManagementAdmin } from "./components/stem/admin/UserManagementAdmin";
import { RolesPermissionsAdmin } from "./components/stem/admin/RolesPermissionsAdmin";

const stub = (title: string, phase?: string) => ({
  Component: () => createElement(ComingSoon, { title, phase }),
});

export const router = createBrowserRouter([
  { path: "/login", Component: Login },

  {
    path: "/",
    Component: AuthGuard,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: LegacyDashboard },

          /* ============ SUPPLIER ============ */
          { path: "supplier/dashboard",               Component: SupplierDashboard },
          { path: "supplier/packages",                Component: STEMPackageCatalog },
          { path: "supplier/packages/:id/configure",  Component: STEMPackageConfigurator },
          { path: "supplier/programs",                Component: STEMProgramManager },
          { path: "supplier/content/authoring",       Component: ContentAuthoringStudio },
          { path: "supplier/content/library",         Component: ContentLibraryBank },
          { path: "supplier/media",                   Component: MediaAssetManager },
          { path: "supplier/exams",                   Component: STEMExamEcosystem },
          { path: "supplier/training",                Component: TeacherTrainingProgram },
          { path: "supplier/orders",                  Component: STEMOrderManagement },
          { path: "supplier/warranty",                Component: WarrantyFulfillment },
          { path: "supplier/licenses",                Component: LicenseDistribution },
          { path: "supplier/software",                Component: SoftwareInstaller },
          { path: "supplier/schools",                 Component: SchoolsDirectoryNCC },
          { path: "supplier/distributors",            Component: DistributorNetwork },
          { path: "supplier/revenue",                 Component: SupplierRevenueDashboard },
          { path: "supplier/analytics",               Component: TeachingEffectivenessAnalytics },

          /* ============ DISTRIBUTOR ============ */
          { path: "distributor/dashboard",            Component: DistributorDashboard },
          { path: "distributor/orders",               Component: DistributorOrderBoard },
          { path: "distributor/contracts",            Component: STEMContractManagement },
          { path: "distributor/inventory",            Component: VirtualInventory },
          { path: "distributor/commission",           Component: CommissionReconciliation },
          { path: "distributor/revenue",              Component: RevenueReports },
          { path: "distributor/customers",            Component: CRMCustomerManagement },
          { path: "distributor/customer-care",        Component: CustomerCare },
          { path: "distributor/sales-app",            Component: SalesApp },

          /* ============ SCHOOL ============ */
          { path: "school/dashboard",                 Component: SchoolDashboard },
          { path: "school/purchase",                  Component: SchoolPurchaseFlow },
          { path: "school/equipment",                 Component: EquipmentInventory },
          { path: "school/warranty",                  Component: WarrantyTicketing },
          { path: "school/teachers",                  Component: TeacherManagement },
          { path: "school/students",                  Component: StudentManagement },
          { path: "school/schedule",                  Component: STEMSchedulePlanner },
          { path: "school/licenses",                  Component: SchoolLicensePanel },
          { path: "school/reports",                   Component: SchoolSTEMEffectivenessReport },

          /* ============ AUTHORITY ============ */
          { path: "authority/dashboard",              Component: RegionalEducationDashboard },
          { path: "authority/schools",                Component: SchoolDirectory },
          { path: "authority/equipment-compliance",   Component: EquipmentComplianceMonitor },
          { path: "authority/procurement",            Component: ProcurementCostAnalytics },
          { path: "authority/data-sync",              Component: NationalDataSync },
          { path: "authority/catalogs",               Component: CommonCatalogManager },
          { path: "authority/reports",                Component: MinistryReportExporter },
          { path: "authority/analytics",              Component: RegionalEducationDashboard },

          /* ============ TEACHER ============ */
          { path: "teacher/dashboard",                Component: TeacherDashboard },
          { path: "teacher/schedule",                 Component: STEMScheduleViewer },
          { path: "teacher/lessons",                  Component: TeacherResourceDownloader },
          { path: "teacher/lesson-plan-builder",      Component: LessonPlanBuilder },
          { path: "teacher/resources",                Component: TeacherResourceDownloader },
          { path: "teacher/training",                 Component: TeacherTrainingHub },
          { path: "teacher/classes",                  Component: StudentProgressTracker },
          { path: "teacher/grading",                  Component: StudentProgressTracker },
          { path: "teacher/exams",                    ...stub("Kiểm tra & Đề thi", "Phase 5") },
          { path: "teacher/equipment-check",          Component: ClassroomEquipmentCheck },

          /* ============ STUDENT ============ */
          { path: "student/dashboard",                Component: StudentHome },
          { path: "student/schedule",                 Component: StudentScheduleViewer },
          { path: "student/lessons",                  Component: StudentLessonPlayer },
          { path: "student/exams",                    Component: STEMExamParticipation },
          { path: "student/achievements",             Component: StudentAchievements },
          { path: "student/certificates",             Component: StudentCertificates },

          /* ============ ADMIN (System) ============ */
          { path: "admin/dashboard",                  Component: AdminDashboard },
          { path: "admin/tenants",                    Component: TenantManagementAdmin },
          { path: "admin/tenant-onboarding",          Component: TenantOnboarding },
          { path: "admin/users",                      Component: UserManagementAdmin },
          { path: "admin/roles",                      Component: RolesPermissionsAdmin },
          { path: "admin/licenses",                   Component: LicenseMonitoring },
          { path: "admin/dev-portal",                 Component: DevPortal },
          { path: "admin/data-lake",                  Component: DataLakeCenter },
          { path: "admin/security",                   Component: SecurityConfig },
          { path: "admin/platform",                   Component: PlatformConfig },
          { path: "admin/audit",                      Component: AuditLogAdmin },
          { path: "admin/system-health",              Component: SystemHealthMonitor },
          { path: "admin/cross-tenant-log",           Component: CrossTenantAccessLog },

          /* ============ SHARED ============ */
          { path: "shared/profile",                   Component: UserProfile },
          { path: "shared/settings",                  Component: Settings },
          { path: "shared/notifications",             Component: Notifications },
          { path: "shared/messages",                  Component: Messaging },
          { path: "shared/announcements",             Component: Announcements },
          { path: "shared/ai-buddy",                  Component: AIBuddyPanel },

          { path: "*",                                Component: NotFound },
        ],
      },
    ],
  },
]);
