# Geleximco STEM Platform

Hệ sinh thái Giáo dục STEM toàn diện cho ngành giáo dục Việt Nam — nền tảng multi-tenant quản trị 7 phân hệ: Nhà cung cấp · Đại lý · Trường học · Cơ quan Quản lý · Giáo viên · Học sinh · System Admin.

> Codebase đang trong quá trình chuyển đổi từ LMS nội bộ Geleximco sang nền tảng STEM Platform.
> Xem kế hoạch đầy đủ tại [docs/STEM-Transformation-Plan.md](docs/STEM-Transformation-Plan.md).

## Chạy dự án

```bash
npm install
npm run dev      # Dev server tại http://localhost:5173
npm run build    # Build production
```

## Tài khoản demo

Tất cả tài khoản demo dùng chung mật khẩu: `stem@123`

| Vai trò | Email | Truy cập |
|---|---|---|
| NCC · Quản trị | supplier@geleximco-stem.vn | /supplier/* |
| NCC · Nội dung | content@geleximco-stem.vn | /supplier/content, programs, exams |
| Đại lý · Quản trị | distributor@abc-edu.vn | /distributor/* |
| Đại lý · Kinh doanh | sales@abc-edu.vn | /distributor/orders, customers |
| Trường · Hiệu trưởng | principal@thcs-bavi.edu.vn | /school/* |
| Giáo viên | teacher.toan@thcs-bavi.edu.vn | /teacher/* |
| Học sinh | student01@thcs-bavi.edu.vn | /student/* |
| Sở GD&ĐT | doet@hanoi.gov.vn | /authority/* |
| Quản trị Nền tảng | sysadmin@geleximco-stem.vn | /admin/* |

Trang login hiển thị 9 tile demo để đăng nhập nhanh. Ngoài ra có nút "Đăng nhập bằng VNeID" (mock).

## Cấu trúc thư mục

```
src/app/
├── App.tsx, routes.ts           ← entry + routing 7 namespace
├── components/
│   ├── Layout.tsx, Login.tsx    ← khung layout + màn login
│   ├── AuthContext.tsx          ← 15 StemRole × 4 TenantType
│   ├── AuthGuard.tsx            ← RBAC redirect
│   ├── permissions.ts           ← ma trận quyền
│   ├── stem/
│   │   ├── nav-groups.ts        ← sidebar theo từng role
│   │   └── ComingSoon.tsx       ← placeholder cho route chưa build
│   ├── mock-data/               ← mock domain data mới (STEM)
│   │   ├── types.ts, constants.ts
│   │   ├── tenants.ts, packages.ts, equipment.ts
│   │   ├── orders-contracts.ts, warranty.ts, licenses.ts
│   │   ├── schedules.ts, exams.ts, lessons.ts
│   │   ├── inventory.ts, authority-data.ts, catalogs-sync.ts
│   │   └── index.ts
│   └── ...(component legacy giữ lại để tái sử dụng Phase 3-7)
└── styles/
    └── theme.css                ← brand tokens Geleximco + STEM tokens
```

## Tài liệu

- [docs/STEM-Transformation-Plan.md](docs/STEM-Transformation-Plan.md) — Kế hoạch chuyển đổi đầy đủ (17 phần, 1.300+ dòng)
- [docs/IA-7-modules.md](docs/IA-7-modules.md) — Kiến trúc thông tin 7 phân hệ
- [docs/data-model.md](docs/data-model.md) — Mô hình dữ liệu & ER
- [docs/permission-matrix.md](docs/permission-matrix.md) — RBAC matrix
- [docs/api-contract-spec.md](docs/api-contract-spec.md) — Draft OpenAPI cho backend

## Trạng thái triển khai

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 0 | Chuẩn bị & docs | Hoàn thành |
| 1 | Brand + Auth + Routing 7 namespace | Hoàn thành |
| 2 | Mock data theo 7 phân hệ | Hoàn thành |
| 3 | NCC + Đại lý (B2B core) — 17 trang + 2 dashboard | Hoàn thành |
| 4 | Trường + Giáo viên + Học sinh (B2C core) — 20 trang | Hoàn thành |
| 5 | Cơ quan Quản lý — 7 trang | Hoàn thành |
| 6 | System Admin — 10 trang | Hoàn thành |
| 7 | AI-Buddy Panel (4 tab: Chat · Recommend · Grade · Analyze) | Hoàn thành |

## Các trang đã triển khai đầy đủ (Phase 3)

**Phân hệ Nhà cung cấp (Supplier):**
- Dashboard tổng hợp, Danh mục gói STEM (3 tier), Configurator tham số động
- Quản lý Chương trình CT1–CT5, Thư viện Media
- Quản lý Đơn hàng, Điều phối Bảo hành (kanban 7 cột)
- Phát/Thu License, Software Installer (campaign rollout)
- Dashboard Doanh thu (charts)

**Phân hệ Đại lý (Distributor):**
- Dashboard, Order Board (kanban), Hợp đồng STEM
- Kho ảo (virtual inventory), Đối soát Hoa hồng
- Báo cáo Doanh thu, CRM Khách hàng, Chăm sóc KH
- Sales App (mobile-optimized quick quote)

## Các trang Phase 4 (Trường + Giáo viên + Học sinh)

**Phân hệ Trường học (School):**
- Dashboard, Purchase Flow (wizard 4 bước đặt mua gói STEM)
- Equipment Inventory (QR scan), Warranty Ticketing (báo lỗi)
- Teacher Management, Student Management (VNeID verified)
- STEM Schedule Planner (lưới thời khóa biểu 6×8)
- License Panel, Effectiveness Report (Radar + BarChart)

**Phân hệ Giáo viên (Teacher):**
- Dashboard, Schedule Viewer (tuần)
- Training Hub (đồng hành 5 năm), Resource Downloader (giáo án CT1–CT5)
- Classroom Equipment Check (đầu tiết), Student Progress Tracker
- Lesson Plan Builder (AI-Buddy gợi ý)

**Phân hệ Học sinh (Student):**
- Home (hero + today schedule + recommendations)
- Schedule Viewer, Lesson Player (video modal)
- STEM Exam Participation (4 cấp: trường/huyện/tỉnh/quốc gia)
- Achievements (AI-Buddy phân tích + Radar + Badges)
- Certificates (đã đạt + đang chinh phục)

## Các trang Phase 5 (Cơ quan Quản lý — Sở/Bộ GD&ĐT)

- Regional Education Dashboard (heatmap tỉnh + trending)
- School Directory (danh bạ trường + compliance %)
- Equipment Compliance Monitor (theo cấp học, underperformers)
- Procurement Cost Analytics (chi phí × khối × nguồn kinh phí)
- National Data Sync (CSDL Quốc gia + VNeID + "Đúng–Đủ–Sạch–Sống")
- Common Catalog Manager (môn học, cấp, skill, program)
- Ministry Report Exporter (Thông tư 38/2023, 32/2020, CV 1014...)

## Các trang Phase 6 (System Admin)

- Admin Dashboard (platform health + top tenants)
- Tenant Management + Onboarding Wizard 4 bước
- License Monitoring (consolidated across all tenants)
- Dev Portal — API Gateway (13 endpoints + API keys + webhooks + OpenAPI docs)
- Data Lake Center (5 tab: Overview / NEdu / VNeID / ETL / 4Đ Quality)
- Security Config (SSL, SSO, 2FA, VNeID mandatory, IP allowlist)
- Platform Config (branding / plugins / OTA / mobile app)
- System Health Monitor (10 services + CPU/Memory/API calls)
- Audit Log (40 entries với severity filter)
- Cross-Tenant Access Log (flagged anomalies + admin override)

## Phase 7 — AI-Buddy

- **AI-Buddy Panel** tại `/shared/ai-buddy` — 4 tab:
  - Chat (starter + quick prompts + mock replies theo context)
  - Gợi ý bài học (personalized theo program)
  - Chấm bài (rubric auto + nhận xét + điểm thành phần)
  - Phân tích HS (Radar 6 năng lực + BarChart CT1–CT5 + recommendations)

Các route đã đăng ký đầy đủ ở Phase 1; route chưa hoàn thiện hiển thị trang `ComingSoon` kèm phase dự kiến.

## Stack kỹ thuật

React 18.3 · Vite 6.3 · TypeScript · TailwindCSS v4 · Radix UI · React Router 7 · Recharts · react-dnd · react-hook-form · lucide-react · sonner.
