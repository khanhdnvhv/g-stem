# API Contract Specification — Geleximco STEM Platform

> Draft OpenAPI cho team backend triển khai sau.
> UI frontend hiện tại đang dùng mock data mô phỏng các endpoint này.

## Danh mục 8 nhóm API chính

### 1. Auth & VNeID
- `POST /api/auth/login` — email/password
- `POST /api/auth/vneid` — OAuth VNeID
- `POST /api/auth/sso/initiate` — SSO redirect
- `GET /api/auth/me` — current user

### 2. Tenant
- `GET /api/tenants`
- `POST /api/tenants` — tạo tenant (onboarding)
- `PATCH /api/tenants/:id`
- `GET /api/tenants/:id/usage` — license + storage

### 3. STEM Packages & Programs
- `GET /api/packages`
- `POST /api/packages` — tạo gói (supplier)
- `GET /api/packages/:id`
- `PATCH /api/packages/:id/configuration`
- `GET /api/programs` — CT1–CT5
- `GET /api/programs/:code/lessons`

### 4. Orders & Contracts
- `GET /api/orders?tenantId=&status=`
- `POST /api/orders` — tạo đơn
- `PATCH /api/orders/:id/status`
- `GET /api/contracts`
- `POST /api/contracts`
- `GET /api/contracts/:id/milestones`

### 5. Equipment & Warranty
- `GET /api/equipment?schoolId=`
- `PATCH /api/equipment/:id/status`
- `POST /api/equipment/:id/check` — GV check-in
- `GET /api/warranty-tickets`
- `POST /api/warranty-tickets` — trường tạo
- `PATCH /api/warranty-tickets/:id` — NCC xử lý

### 6. Licenses
- `GET /api/licenses?tenantId=`
- `POST /api/licenses/distribute` — phân bổ auto theo order
- `POST /api/licenses/:id/revoke`

### 7. Schedule & Exam
- `GET /api/schedule?schoolId=&classId=&teacherId=&studentId=&weekOf=`
- `POST /api/schedule`
- `GET /api/exams?level=&gradeLevel=`
- `POST /api/exams/:id/submit`

### 8. Authority & Data Sync
- `GET /api/authority/overview?province=&district=`
- `GET /api/authority/compliance`
- `GET /api/authority/procurement?year=&fundingSource=`
- `POST /api/data-sync/nedu` — push/pull
- `POST /api/data-sync/vneid`
- `GET /api/data-sync/records?source=`
- `POST /api/reports/ministry/export` — body: { templateCode, period, scope }

## Webhook (cho Dev Portal)
- `order.created`, `order.status_changed`
- `warranty.created`, `warranty.resolved`
- `license.distributed`, `license.revoked`
- `data-sync.completed`, `data-sync.failed`

## Rate limits (mặc định Dev Portal)
- Read: 600 req/min
- Write: 120 req/min
- Bulk/export: 10 req/min
