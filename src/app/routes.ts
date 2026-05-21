import { createElement } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { AuthGuard } from "./components/AuthGuard";
import { Login } from "./components/Login";
import { NotFound } from "./components/NotFound";
import { ComingSoon } from "./components/stem/ComingSoon";

// === Module Selector (portal page after login) =======================
import { ModuleSelector } from "./components/ModuleSelector";

// === Component cũ dùng lại ===========================================
import { UserProfile } from "./components/UserProfile";
import { Settings } from "./components/Settings";
import { Notifications } from "./components/Notifications";
import { Messaging } from "./components/Messaging";
import { Announcements } from "./components/Announcements";
import { Dashboard as LegacyDashboard } from "./components/Dashboard";
import { Quizzes as LegacyQuizzes } from "./components/Quizzes";

// === Supplier — Phase 3 ==============================================
import { SupplierDashboard } from "./components/stem/supplier/SupplierDashboard";
import { STEMPackageCatalog } from "./components/stem/supplier/STEMPackageCatalog";
import { STEMPackageConfigurator } from "./components/stem/supplier/STEMPackageConfigurator";
import { PackageDetail } from "./components/stem/supplier/PackageDetail";
import { STEMProgramManager } from "./components/stem/supplier/STEMProgramManager";
import { MediaAssetManager } from "./components/stem/supplier/MediaAssetManager";
import { STEMOrderManagement } from "./components/stem/supplier/STEMOrderManagement";
import { LicenseDistribution } from "./components/stem/supplier/LicenseDistribution";
import { SoftwareInstaller } from "./components/stem/supplier/SoftwareInstaller";
import { WarrantyFulfillment } from "./components/stem/supplier/WarrantyFulfillment";
import { SupplierRevenueDashboard } from "./components/stem/supplier/SupplierRevenueDashboard";
import { ContentAuthoringStudio } from "./components/stem/supplier/ContentAuthoringStudio";
import { LessonEditor } from "./components/stem/supplier/LessonEditor";
import { ResearchProjectEditor } from "./components/stem/supplier/ResearchProjectEditor";
import { ContentLibraryBank } from "./components/stem/supplier/ContentLibraryBank";
import { STEMExamEcosystem } from "./components/stem/supplier/STEMExamEcosystem";
import { ExamDetail } from "./components/stem/supplier/ExamDetail";
import { ExamQuestionBank } from "./components/stem/supplier/ExamQuestionBank";
import { TeacherTrainingProgram } from "./components/stem/supplier/TeacherTrainingProgram";
import { SchoolsDirectoryNCC } from "./components/stem/supplier/SchoolsDirectoryNCC";
import { DistributorNetwork } from "./components/stem/supplier/DistributorNetwork";
import { TeachingEffectivenessAnalytics } from "./components/stem/supplier/TeachingEffectivenessAnalytics";
import { ContentItemDetail } from "./components/stem/supplier/ContentItemDetail";
import { DeviceCatalog } from "./components/stem/supplier/DeviceCatalog";
import { SupplierContractList } from "./components/stem/supplier/SupplierContractList";
import { SupplierContractDetail } from "./components/stem/supplier/SupplierContractDetail";

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
import { TeacherProfile } from "./components/stem/school/TeacherProfile";
import { StudentManagement } from "./components/stem/school/StudentManagement";
import { StudentProfile } from "./components/stem/school/StudentProfile";
import { STEMSchedulePlanner } from "./components/stem/school/STEMSchedulePlanner";
import { SchoolLicensePanel } from "./components/stem/school/SchoolLicensePanel";
import { SchoolSTEMEffectivenessReport } from "./components/stem/school/SchoolSTEMEffectivenessReport";
import { SchoolProfile } from "./components/stem/school/SchoolProfile";
import { ClassManagement } from "./components/stem/school/ClassManagement";
import { RoomList } from "./components/stem/school/RoomList";
import { RoomDetail } from "./components/stem/school/RoomDetail";
import { RoomBooking } from "./components/stem/school/RoomBooking";
import { STEMSlotPlanner } from "./components/stem/school/STEMSlotPlanner";
import { LicenseAssign } from "./components/stem/school/LicenseAssign";
import { CourseList } from "./components/stem/school/CourseList";
import { CourseAssign } from "./components/stem/school/CourseAssign";
import { RoomROIReport } from "./components/stem/school/RoomROIReport";
import { ReportBuilder } from "./components/stem/school/ReportBuilder";
import { SchoolSettings } from "./components/stem/school/SchoolSettings";

// === Teacher — Phase 4 ===============================================
import { TeacherDashboard } from "./components/stem/teacher/TeacherDashboard";
import { STEMScheduleViewer } from "./components/stem/teacher/STEMScheduleViewer";
import { TeacherTrainingHub } from "./components/stem/teacher/TeacherTrainingHub";
import { TeacherResourceDownloader } from "./components/stem/teacher/TeacherResourceDownloader";
import { ClassroomEquipmentCheck } from "./components/stem/teacher/ClassroomEquipmentCheck";
import { StudentProgressTracker } from "./components/stem/teacher/StudentProgressTracker";
import { LessonPlanBuilder } from "./components/stem/teacher/LessonPlanBuilder";
import { TeacherGrading } from "./components/stem/teacher/TeacherGrading";
import { TeacherClasses } from "./components/stem/teacher/TeacherClasses";

// === Student — Phase 4 ===============================================
import { StudentLMSDesign } from "./components/stem/student/StudentLMSDesign";
import { StudentHome } from "./components/stem/student/StudentHome";
import { StudentScheduleViewer } from "./components/stem/student/StudentScheduleViewer";
import { StudentLessonPlayer } from "./components/stem/student/StudentLessonPlayer";
import { STEMExamParticipation } from "./components/stem/student/STEMExamParticipation";
import { StudentAchievements } from "./components/stem/student/StudentAchievements";
import { StudentCertificates } from "./components/stem/student/StudentCertificates";
import StudentCourseList from "./components/stem/student/StudentCourseList";
import StudentCourseDetail from "./components/stem/student/StudentCourseDetail";
import THLessonPlayer from "./components/stem/student/THLessonPlayer";
import STEMChallengeDetail from "./components/stem/student/STEMChallengeDetail";
import StudentExercises from "./components/stem/student/StudentExercises";
import StudentSubmitProduct from "./components/stem/student/StudentSubmitProduct";
import StudentNotebook from "./components/stem/student/StudentNotebook";
import StudentForum from "./components/stem/student/StudentForum";
import StudentPortfolio from "./components/stem/student/StudentPortfolio";

// === Authority — Phase 5 =============================================
import { RegionalEducationDashboard } from "./components/stem/authority/RegionalEducationDashboard";
import { SchoolDirectory } from "./components/stem/authority/SchoolDirectory";
import { AuthoritySchoolDetail } from "./components/stem/authority/AuthoritySchoolDetail";
import { EquipmentComplianceMonitor } from "./components/stem/authority/EquipmentComplianceMonitor";
import { ProcurementCostAnalytics } from "./components/stem/authority/ProcurementCostAnalytics";
import { NationalDataSync } from "./components/stem/authority/NationalDataSync";
import { CommonCatalogManager } from "./components/stem/authority/CommonCatalogManager";
import { MinistryReportExporter } from "./components/stem/authority/MinistryReportExporter";
import { AuthorityReportTT38 } from "./components/stem/authority/AuthorityReportTT38";
import { AuthorityReportCV1014 } from "./components/stem/authority/AuthorityReportCV1014";
import { AuthorityReportBuilder } from "./components/stem/authority/AuthorityReportBuilder";
import { AdvancedAnalytics } from "./components/stem/authority/AdvancedAnalytics";
import { ProvinceExamMonitor } from "./components/stem/authority/ProvinceExamMonitor";
import { ProvinceLicenseOverview } from "./components/stem/authority/ProvinceLicenseOverview";
import { AuthorityProgramViewer } from "./components/stem/authority/AuthorityProgramViewer";
import { AuthorityContentReview } from "./components/stem/authority/AuthorityContentReview";
import { AuthorityLearningResults } from "./components/stem/authority/AuthorityLearningResults";
import { AuthorityEvents } from "./components/stem/authority/AuthorityEvents";
import { AuthorityNews } from "./components/stem/authority/AuthorityNews";
import { AuthoritySettings } from "./components/stem/authority/AuthoritySettings";

// === AI-Buddy — Phase 7 ==============================================
import { AIBuddyPanel } from "./components/stem/ai/AIBuddyPanel";

// === Admin (System) — Phase 6 ========================================
import { AdminDashboard } from "./components/stem/admin/AdminDashboard";
import { OrganizationManagement } from "./components/stem/admin/OrganizationManagement";
import { OrganizationDetail } from "./components/stem/admin/OrganizationDetail";
import { OrgTree } from "./components/stem/admin/OrgTree";
import { AccountList } from "./components/stem/admin/AccountList";
import { AccountDetail } from "./components/stem/admin/AccountDetail";
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
import { SupplierManagement as AdminSupplierManagement } from "./components/stem/admin/SupplierManagement";
import { SupplierDetail as AdminSupplierDetail } from "./components/stem/admin/SupplierDetail";
import { MasterDataAdmin } from "./components/stem/admin/MasterDataAdmin";
import { EducationLevelAdmin } from "./components/stem/admin/EducationLevelAdmin";
import { SubjectAdmin } from "./components/stem/admin/SubjectAdmin";
import { TextbookAdmin } from "./components/stem/admin/TextbookAdmin";
import { GradeAdmin } from "./components/stem/admin/GradeAdmin";
import { MiscAdmin } from "./components/stem/admin/MiscAdmin";

// === PUBLIC LAYER (V1, no auth) ======================================
import { PublicLayout } from "./components/public/layout/PublicLayout";
import {
  Home,
  About,
  SolutionsHub,
  SolutionMinimum,
  SolutionBasic,
  SolutionAdvanced,
  ProgramsHub,
  ProgramCT1,
  ProgramCT2,
  ProgramCT3,
  ProgramCT4,
  ProgramCT5,
  PartnersHub,
  PartnerGeleximco,
  PartnerEBD,
  PartnerNexta,
  NewsList,
  NewsDetail,
  Events,
  Contact,
  SupportHub,
  FAQ,
  KBHub,
  KBArticle,
  TicketNew,
  Downloads,
} from "./components/public/pages";

const stub = (title: string, phase?: string) => ({
  Component: () => createElement(ComingSoon, { title, phase }),
});

// Base URL từ Vite (strip trailing slash). Trên GH Pages sẽ là "/stem", dev thì ""
const routerBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export const router = createBrowserRouter([
  { path: "/login", Component: Login },

  /* ================================================================ */
  /* PUBLIC LAYER (V1) — 26 marketing pages, KHÔNG cần auth           */
  /* ================================================================ */
  {
    Component: PublicLayout,
    children: [
      { path: "/",                              Component: Home },
      { path: "/about",                         Component: About },

      /* — Solutions */
      { path: "/solutions",                     Component: SolutionsHub },
      { path: "/solutions/minimum",             Component: SolutionMinimum },
      { path: "/solutions/basic",               Component: SolutionBasic },
      { path: "/solutions/advanced",            Component: SolutionAdvanced },

      /* — Programs */
      { path: "/programs",                      Component: ProgramsHub },
      { path: "/programs/ct1",                  Component: ProgramCT1 },
      { path: "/programs/ct2",                  Component: ProgramCT2 },
      { path: "/programs/ct3",                  Component: ProgramCT3 },
      { path: "/programs/ct4",                  Component: ProgramCT4 },
      { path: "/programs/ct5",                  Component: ProgramCT5 },

      /* — Partners */
      { path: "/partners",                      Component: PartnersHub },
      { path: "/partners/geleximco-stem",       Component: PartnerGeleximco },
      { path: "/partners/ebd",                  Component: PartnerEBD },
      { path: "/partners/nexta",                Component: PartnerNexta },

      /* — News + Events */
      { path: "/news",                          Component: NewsList },
      { path: "/news/:slug",                    Component: NewsDetail },
      { path: "/events",                        Component: Events },

      /* — Contact + Support */
      { path: "/contact",                       Component: Contact },
      { path: "/support",                       Component: SupportHub },
      { path: "/support/faq",                   Component: FAQ },
      { path: "/support/kb",                    Component: KBHub },
      { path: "/support/kb/:slug",              Component: KBArticle },
      { path: "/support/ticket-new",            Component: TicketNew },

      /* — Downloads */
      { path: "/downloads",                     Component: Downloads },
    ],
  },

  /* ================================================================ */
  /* APP LAYER (authenticated) — existing routes giữ nguyên           */
  /* ================================================================ */
  {
    path: "/",
    Component: AuthGuard,
    children: [
      { path: "modules", Component: ModuleSelector },
      {
        Component: Layout,
        children: [
          { path: "dashboard",                  Component: LegacyDashboard },

          /* ============ SUPPLIER ============ */
          { path: "supplier/dashboard",               Component: SupplierDashboard },
          { path: "supplier/packages",                  Component: STEMPackageCatalog },
          { path: "supplier/packages/new",             Component: STEMPackageConfigurator },
          { path: "supplier/packages/:id",             Component: PackageDetail },
          { path: "supplier/packages/:id/configure",   Component: STEMPackageConfigurator },
          { path: "supplier/programs",                Component: STEMProgramManager },
          { path: "supplier/content/authoring",                    Component: ContentAuthoringStudio },
          { path: "supplier/content/authoring/new",                Component: LessonEditor },
          { path: "supplier/content/authoring/research/new",       Component: ResearchProjectEditor },
          { path: "supplier/content/authoring/research/:lessonId", Component: ResearchProjectEditor },
          { path: "supplier/content/authoring/:lessonId",          Component: LessonEditor },
          { path: "supplier/content/library",         Component: ContentLibraryBank },
          { path: "supplier/content/library/:id",     Component: ContentItemDetail },
          { path: "supplier/devices",                 Component: DeviceCatalog },
          { path: "supplier/contracts",               Component: SupplierContractList },
          { path: "supplier/contracts/:id",           Component: SupplierContractDetail },
          { path: "supplier/media",                   Component: MediaAssetManager },
          { path: "supplier/exams",                   Component: STEMExamEcosystem },
          { path: "supplier/exams/questions",         Component: ExamQuestionBank },
          { path: "supplier/exams/:id",               Component: ExamDetail },
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
          { path: "school/profile",                   Component: SchoolProfile },
          { path: "school/purchase",                  Component: SchoolPurchaseFlow },
          { path: "school/equipment",                 Component: EquipmentInventory },
          { path: "school/warranty",                  Component: WarrantyTicketing },
          { path: "school/teachers",                  Component: TeacherManagement },
          { path: "school/teachers/:id",              Component: TeacherProfile },
          { path: "school/students",                  Component: StudentManagement },
          { path: "school/students/:id",              Component: StudentProfile },
          { path: "school/classes",                   Component: ClassManagement },
          { path: "school/rooms",                     Component: RoomList },
          { path: "school/rooms/booking",             Component: RoomBooking },
          { path: "school/rooms/:id",                 Component: RoomDetail },
          { path: "school/schedule",                  Component: STEMSchedulePlanner },
          { path: "school/stem-slots",                Component: STEMSlotPlanner },
          { path: "school/licenses",                  Component: SchoolLicensePanel },
          { path: "school/license-assign",            Component: LicenseAssign },
          { path: "school/courses",                   Component: CourseList },
          { path: "school/courses/:id/assign",        Component: CourseAssign },
          { path: "school/reports",                   Component: SchoolSTEMEffectivenessReport },
          { path: "school/reports/roi",               Component: RoomROIReport },
          { path: "school/reports/builder",           Component: ReportBuilder },
          { path: "school/settings",                  Component: SchoolSettings },

          /* ============ AUTHORITY ============ */
          { path: "authority/dashboard",              Component: RegionalEducationDashboard },
          { path: "authority/schools",                Component: SchoolDirectory },
          { path: "authority/schools/:schoolId",      Component: AuthoritySchoolDetail },
          { path: "authority/equipment-compliance",   Component: EquipmentComplianceMonitor },
          { path: "authority/procurement",            Component: ProcurementCostAnalytics },
          { path: "authority/reports/procurement",    Component: ProcurementCostAnalytics },
          { path: "authority/data-sync",              Component: NationalDataSync },
          { path: "authority/catalogs",               Component: CommonCatalogManager },
          { path: "authority/reports",                Component: MinistryReportExporter },
          { path: "authority/reports/tt38",           Component: AuthorityReportTT38 },
          { path: "authority/reports/cv1014",         Component: AuthorityReportCV1014 },
          { path: "authority/reports/builder",        Component: AuthorityReportBuilder },
          { path: "authority/analytics",              Component: AdvancedAnalytics },
          { path: "authority/exam-monitor",           Component: ProvinceExamMonitor },
          { path: "authority/licenses",               Component: ProvinceLicenseOverview },
          { path: "authority/programs",               Component: AuthorityProgramViewer },
          { path: "authority/content-review",         Component: AuthorityContentReview },
          { path: "authority/learning-results",       Component: AuthorityLearningResults },
          { path: "authority/events",                 Component: AuthorityEvents },
          { path: "authority/news",                   Component: AuthorityNews },
          { path: "authority/settings",               Component: AuthoritySettings },

          /* ============ TEACHER ============ */
          { path: "teacher/dashboard",                Component: TeacherDashboard },
          { path: "teacher/schedule",                 Component: STEMScheduleViewer },
          { path: "teacher/lessons",                  Component: TeacherResourceDownloader },
          { path: "teacher/lesson-plan-builder",      Component: LessonPlanBuilder },
          { path: "teacher/resources",                Component: TeacherResourceDownloader },
          { path: "teacher/training",                 Component: TeacherTrainingHub },
          { path: "teacher/classes",                  Component: TeacherClasses },
          { path: "teacher/grading",                  Component: TeacherGrading },
          { path: "teacher/exams",                    Component: LegacyQuizzes },
          { path: "teacher/equipment-check",          Component: ClassroomEquipmentCheck },

          /* ============ STUDENT ============ */
          { path: "student/lms-design",               Component: StudentLMSDesign },
          { path: "student/dashboard",                Component: StudentHome },
          { path: "student/schedule",                 Component: StudentScheduleViewer },
          { path: "student/courses",                  Component: StudentCourseList },
          { path: "student/courses/:id",              Component: StudentCourseDetail },
          { path: "student/lessons",                  Component: StudentLessonPlayer },
          { path: "student/lessons/:courseId/:lessonId", Component: THLessonPlayer },
          { path: "student/challenge",                Component: STEMChallengeDetail },
          { path: "student/exercises",                Component: StudentExercises },
          { path: "student/submit",                   Component: StudentSubmitProduct },
          { path: "student/notebook",                 Component: StudentNotebook },
          { path: "student/forum",                    Component: StudentForum },
          { path: "student/exams",                    Component: STEMExamParticipation },
          { path: "student/achievements",             Component: StudentAchievements },
          { path: "student/certificates",             Component: StudentCertificates },
          { path: "student/portfolio",                Component: StudentPortfolio },

          /* ============ ADMIN (System) ============ */
          { path: "admin/dashboard",                  Component: AdminDashboard },
          { path: "admin/organizations",              Component: OrganizationManagement },
          { path: "admin/organizations/tree",         Component: OrgTree },
          { path: "admin/organizations/:id",          Component: OrganizationDetail },
          { path: "admin/suppliers",                  Component: AdminSupplierManagement },
          { path: "admin/suppliers/content",          Component: AdminSupplierManagement },
          { path: "admin/suppliers/violations",       Component: AdminSupplierManagement },
          { path: "admin/suppliers/:id",              Component: AdminSupplierDetail },
          { path: "admin/accounts",                   Component: AccountList },
          { path: "admin/accounts/:id",               Component: AccountDetail },
          { path: "admin/users",                      Component: UserManagementAdmin },
          { path: "admin/roles",                      Component: RolesPermissionsAdmin },
          { path: "admin/master-data/levels",         Component: EducationLevelAdmin },
          { path: "admin/master-data/grades",         Component: GradeAdmin },
          { path: "admin/master-data/subjects",       Component: SubjectAdmin },
          { path: "admin/master-data/schools",        Component: MasterDataAdmin },
          { path: "admin/master-data/textbooks",      Component: TextbookAdmin },
          { path: "admin/master-data/misc",           Component: MiscAdmin },
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
], { basename: routerBase || undefined });
