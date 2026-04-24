# Data Model — Geleximco STEM Platform

> Tài liệu mô tả các entity chính của nền tảng. Tất cả types được định nghĩa trong `src/app/components/mock-data/types.ts`.
> Nguồn tham chiếu chính: `STEM-Transformation-Plan.md` mục 8.

## Sơ đồ ER rút gọn

```
Tenant (1) ─── (N) StemUser
Tenant (1) ─── (N) Order
Tenant (1) ─── (N) Equipment (khi là school)
Tenant (1) ─── (N) License

StemPackage (1) ─── (N) Order.items
StemPackage (1) ─── (N) Equipment (instance từ gói)

School (Tenant) (1) ─── (N) STEMScheduleEntry
School (Tenant) (1) ─── (N) WarrantyTicket → Equipment

Equipment (1) ─── (N) WarrantyTicket
Order (1) ─── (0..1) Contract
Contract (1) ─── (N) CommissionRecord

StemProgram (CT1..CT5) ─── (N) Lesson, STEMScheduleEntry, STEMExam

DataSyncRecord: tracking VNeID / NEdu / ERP / CRM
```

## Entities chính

### Tenant
Khách thuê của nền tảng. 4 loại: `supplier | distributor | school | authority`.

### StemUser
Người dùng thuộc 1 tenant, có 1 `stemRole` cụ thể.

### StemPackage
Gói phòng STEM. 3 tier: `minimum | basic | advanced`.
- `configuration`: 4 nhóm tham số động (infrastructure, smartDevices, furniture, decoration).
- `supportedPrograms`: mảng CT1–CT5.

### Equipment
Instance thiết bị vật lý tại trường.
- Status: `ok | warning | broken | missing`.
- Liên kết với `packageId` và `schoolId`.

### WarrantyTicket
Yêu cầu bảo hành. Có `history` timeline status.

### Order / Contract
Đơn hàng và Hợp đồng B2B giữa Supplier ↔ Distributor ↔ School.

### License
Giấy phép phần mềm. 3 type: `per_user | per_device | site`.

### VirtualStockMovement
Bản ghi xuất/nhập kho ảo của Distributor.

### STEMScheduleEntry
Một tiết học STEM trong thời khóa biểu (hoặc CLB ngoại khóa nếu `isClub=true`).

### STEMExam / AuthorityReport / CatalogItem / DataSyncRecord
Xem chi tiết trong `types.ts`.

## Mock data sinh ra
Xem mục 8.2 của `STEM-Transformation-Plan.md` — tối thiểu:
- 1 supplier + 3 distributor + 15 school + 2 authority
- 50 HS × 5 trường, 10 GV × 5 trường
- 3 package, 200 equipment, 30 warranty, 30 order, 15 contract
- 200 license, 300 schedule entry, 10 exam, 5 report
