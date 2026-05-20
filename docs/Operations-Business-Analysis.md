# PHÂN TÍCH NGHIỆP VỤ — NHÓM "VẬN HÀNH" (NCC)

> **Phiên bản:** 1.0
> **Ngày lập:** 2026-05-20
> **Phạm vi:** Tenant Supplier (NCC) — 5 module: Đơn hàng, Hợp đồng, Bảo hành, License, Bộ cài Phần mềm
> **Loại tài liệu:** Business Analysis (BA Phase 2 — ANALYZE)
> **Nguồn:** STEM-Transformation-Plan.md §2.1–2.3, data-model.md, review hiện trạng 2026-05-20

---

## Mục lục

1. [Bối cảnh & Phạm vi nghiệp vụ](#1-bối-cảnh--phạm-vi-nghiệp-vụ)
2. [Actors & Trách nhiệm](#2-actors--trách-nhiệm)
3. [Quy trình nghiệp vụ tổng thể (Business Process)](#3-quy-trình-nghiệp-vụ-tổng-thể)
4. [Đặc tả 5 giai đoạn chi tiết](#4-đặc-tả-5-giai-đoạn-chi-tiết)
5. [Mô hình thực thể & Quan hệ (ERD)](#5-mô-hình-thực-thể--quan-hệ)
6. [State Machine — vòng đời từng thực thể](#6-state-machine--vòng-đời-từng-thực-thể)
7. [Business Rules](#7-business-rules)
8. [Use Cases chính](#8-use-cases-chính)
9. [Edge Cases & Rủi ro](#9-edge-cases--rủi-ro)
10. [Gap phân tích — Data model & Module thiếu](#10-gap-phân-tích)
11. [Câu hỏi nghiệp vụ cần chốt (Open Questions)](#11-câu-hỏi-nghiệp-vụ-cần-chốt)
12. [Giả định đang dùng (Assumptions)](#12-giả-định-đang-dùng)

---

## 1. Bối cảnh & Phạm vi nghiệp vụ

### 1.1. Bản chất nghiệp vụ

Nhóm "Vận hành" quản lý **toàn bộ vòng đời thương mại của 1 gói STEM** — từ lúc trường đặt mua đến lúc bàn giao, vận hành và hậu mãi.

Đây là mô hình **lai (hybrid)**:
- **Hàng hoá vật lý**: thiết bị STEM (robot, cảm biến, bàn ghế lab...) → cần giao hàng, lắp đặt, bảo hành
- **Sản phẩm số**: phần mềm + giấy phép (license) → cần cài đặt, cấp phép, gia hạn
- **Dịch vụ**: lắp đặt, tập huấn GV, đồng hành 5 năm

→ Một đơn hàng STEM **không kết thúc khi thanh toán** — nó mở ra chuỗi fulfillment dài (giao hàng → cài đặt → cấp phép → tập huấn → nghiệm thu → bảo hành).

### 1.2. Vị trí trong hệ sinh thái

```
        ┌─────────────┐   đặt hàng   ┌──────────────┐
        │   TRƯỜNG    │ ───────────▶ │  ĐẠI LÝ      │ (môi giới, tùy chọn)
        │  (school)   │              │ (distributor)│
        └─────────────┘              └──────┬───────┘
              │ đặt trực tiếp                │ chuyển đơn
              │                              ▼
              │                       ┌──────────────┐
              └──────────────────────▶│     NCC      │ ◀── nhóm "Vận hành"
                                      │ (Geleximco)  │     nằm ở đây
                                      └──────────────┘
```

### 1.3. 5 module thuộc nhóm

| Module | Vai trò trong vòng đời |
|---|---|
| **Đơn hàng** | Cổng tiếp nhận — khởi tạo vòng đời thương mại |
| **Hợp đồng** | Ràng buộc pháp lý — sinh ra sau khi đơn được duyệt |
| **License** | Cấp phép số — sản phẩm số của gói, cấp theo hợp đồng |
| **Bộ cài Phần mềm** | Triển khai số — đẩy phần mềm lên thiết bị đã giao |
| **Bảo hành** | Hậu mãi — duy trì thiết bị vật lý sau bàn giao |

---

## 2. Actors & Trách nhiệm

| Actor | Mã role | Trách nhiệm trong nhóm Vận hành |
|---|---|---|
| **NCC — Nhân viên Kinh doanh** | `supplier_sales` | Tiếp nhận/tạo đơn thủ công, duyệt đơn sơ cấp, soạn hợp đồng |
| **NCC — Quản trị** | `supplier_admin` | Duyệt đơn cấp cao, ký hợp đồng, phê duyệt cấp license |
| **NCC — Nhân viên Bảo hành** | `supplier_warranty` | Tiếp nhận ticket, điều phối kỹ thuật viên, xử lý bảo hành |
| **NCC — Tài chính** | `distributor_finance` (tham chiếu) | Đối soát hoa hồng đại lý |
| **Đại lý** | `distributor_*` | Tạo đơn hộ trường, theo dõi hoa hồng |
| **Trường học** | `school_*` | Đặt đơn, nhận hàng, báo lỗi bảo hành, quản lý license nội bộ |
| **Giáo viên / Học sinh** | `teacher` / `student` | Người dùng cuối của license phần mềm |

### Ma trận RACI rút gọn (R = thực hiện, A = phê duyệt)

| Hoạt động | sales | admin | warranty | distributor | school |
|---|---|---|---|---|---|
| Tạo đơn | R | | | R | R |
| Duyệt đơn | R | A | | | |
| Soạn / Ký hợp đồng | R | A | | | (đồng ký) |
| Cấp License | R | A | | | |
| Tạo Campaign bộ cài | R | | | | |
| Xử lý ticket bảo hành | | | R | | (báo lỗi) |
| Đối soát hoa hồng | | A | | R | |

---

## 3. Quy trình nghiệp vụ tổng thể

### 3.1. AS-IS — Hiện trạng prototype

Mỗi màn hình đứng độc lập, đọc mock tĩnh, hầu hết action là `toast` placeholder. **Vòng đời đóng băng** — không có thực thể nào chuyển trạng thái thực (trừ Bảo hành). Không có liên kết Đơn↔Hợp đồng↔License↔Bộ cài.

### 3.2. TO-BE — Quy trình chuẩn 5 giai đoạn

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐   ┌──────────┐
│ GĐ 1     │──▶│ GĐ 2     │──▶│ GĐ 3     │──▶│ GĐ 4         │──▶│ GĐ 5     │
│ ĐẶT HÀNG │   │ DUYỆT ĐƠN│   │ HỢP ĐỒNG │   │ TRIỂN KHAI   │   │ HẬU MÃI  │
│          │   │          │   │          │   │ (Fulfillment)│   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────────┘   └──────────┘
 Order:draft   Order:pending  Contract:     Order:delivering→   Warranty
 →pending      →approved      draft→signed  delivered            tickets,
                              →active       + Equipment giao     License
                                            + License cấp        gia hạn,
                                            + Campaign bộ cài     Hoa hồng
```

**Nguyên tắc xuyên suốt:** Mỗi giai đoạn sau chỉ mở khoá khi giai đoạn trước hoàn tất → đảm bảo không cấp license khi chưa có hợp đồng, không giao hàng khi chưa duyệt đơn.

---

## 4. Đặc tả 5 giai đoạn chi tiết

### Giai đoạn 1 — ĐẶT HÀNG

| Khía cạnh | Mô tả |
|---|---|
| **Trigger** | Trường cần mua gói STEM; hoặc đại lý chốt được khách; hoặc NCC sales nhập đơn |
| **Actor** | school / distributor / supplier_sales |
| **Input** | Gói STEM (1 hoặc nhiều), số lượng, trường thụ hưởng, đại lý môi giới (nếu có) |
| **3 kênh đặt hàng** | (a) Trực tiếp: Trường → NCC; (b) Qua đại lý: Trường → Đại lý → NCC; (c) Thủ công: NCC sales nhập hộ |
| **Process** | Chọn gói → tính `totalVND` = Σ(quantity × unitPrice) → ghi `fromTenantId` (trường), `toTenantId` (NCC), `distributorTenantId?` |
| **Output** | `Order` mới, `status = "pending"` (hoặc `draft` nếu lưu nháp) |
| **Status** | `draft` → `pending` |

### Giai đoạn 2 — DUYỆT ĐƠN

| Khía cạnh | Mô tả |
|---|---|
| **Trigger** | Đơn ở trạng thái `pending` |
| **Actor** | supplier_sales (sơ cấp) → supplier_admin (phê duyệt) |
| **Process** | NCC review: gói còn `active`?, giá hợp lý?, trường hợp lệ?, đại lý hợp lệ? |
| **Quyết định** | **Duyệt** → `approved`; **Từ chối** → `cancelled` (kèm lý do) |
| **Output** | Đơn `approved` → kích hoạt GĐ 3 (sinh hợp đồng nháp) |
| **Status** | `pending` → `approved` \| `cancelled` |

### Giai đoạn 3 — HỢP ĐỒNG

| Khía cạnh | Mô tả |
|---|---|
| **Trigger** | Đơn `approved` |
| **Actor** | supplier_sales soạn → supplier_admin ký |
| **Process** | Sinh `Contract` từ đơn: gắn các bên (NCC, đại lý?, trường), `totalVND`, `commissionPct` (nếu có đại lý), khởi tạo **bộ milestone chuẩn** |
| **Milestone chuẩn STEM** | 1) Ký HĐ & tạm ứng · 2) Giao thiết bị · 3) Lắp đặt & cấu hình · 4) Cài phần mềm + cấp license · 5) Tập huấn GV · 6) Nghiệm thu & thanh toán · 7) Bàn giao bảo hành |
| **Output** | `Contract` ký xong → `active`; đơn liên kết qua `Order.contractId` |
| **Status** | Contract: `draft` → `signed` → `active` |

### Giai đoạn 4 — TRIỂN KHAI (Fulfillment)

Giai đoạn phức tạp nhất — gồm **3 luồng song song**:

| Luồng | Mô tả | Sinh ra |
|---|---|---|
| **4a. Giao thiết bị vật lý** | Giao thiết bị trong gói tới trường, lắp đặt | `Equipment` records (gắn `schoolId`, `packageId`, `warrantyEndsAt`) |
| **4b. Cấp License** | Sinh license phần mềm theo `includedSoftware` của gói | `License` records (gắn `tenantId` = trường, `seats`, `expiresAt`) |
| **4c. Cài phần mềm** | Tạo `InstallCampaign` đẩy bộ cài lên thiết bị đã giao | Campaign gắn `licenseId` + danh sách `equipmentId` mục tiêu |
| **Trigger** | Contract `active` |
| **Status đơn** | `approved` → `delivering` → `delivered` |
| **Milestone** | Hoàn tất từng luồng → tick milestone tương ứng |

### Giai đoạn 5 — HẬU MÃI

| Luồng | Mô tả |
|---|---|
| **5a. Bảo hành thiết bị** | Trường báo lỗi → `WarrantyTicket` → NCC điều phối: tiếp nhận → cử KTV → (chờ linh kiện) → xử lý → nghiệm thu → đóng |
| **5b. Vòng đời License** | Theo dõi sắp hết hạn → gia hạn / thu hồi / tái phân bổ seats |
| **5c. Đối soát hoa hồng** | Nếu có đại lý: định kỳ sinh `CommissionRecord`, đối soát, thanh toán |

---

## 5. Mô hình thực thể & Quan hệ

### 5.1. ERD nghiệp vụ chuẩn (TO-BE)

```
                    ┌─────────┐
                    │  Order  │
                    └────┬────┘
                         │ 1:1 (đơn duyệt sinh hợp đồng)
                         ▼
                    ┌──────────┐
          ┌─────────┤ Contract ├──────────┬───────────────┐
          │ 1:N     └────┬─────┘ 1:N      │ 1:N           │ 1:N
          ▼              │                ▼               ▼
     ┌──────────┐        │ 1:N      ┌──────────┐   ┌──────────────────┐
     │ License  │        ▼          │Equipment │   │ CommissionRecord │
     └────┬─────┘  ┌──────────────┐ └────┬─────┘   └──────────────────┘
          │ 1:N    │InstallCampaign│      │ 1:N      (chỉ khi có đại lý)
          └───────▶└──────┬───────┘      ▼
            (campaign      │ N:N    ┌───────────────┐
             dùng license) └───────▶│ WarrantyTicket│
                                    └───────────────┘
```

### 5.2. Bảng quan hệ

| Quan hệ | Kiểu | Ý nghĩa |
|---|---|---|
| Order — Contract | 1:1 | Đơn được duyệt sinh đúng 1 hợp đồng |
| Contract — License | 1:N | 1 HĐ cấp nhiều license (theo software trong gói) |
| Contract — Equipment | 1:N | 1 HĐ giao nhiều thiết bị vật lý |
| Contract — InstallCampaign | 1:N | 1 HĐ có thể có nhiều đợt cài đặt |
| Contract — CommissionRecord | 1:N | Hoa hồng tính theo kỳ, nếu có đại lý |
| InstallCampaign — License | N:1 | Campaign cài đặt dùng license để kích hoạt |
| InstallCampaign — Equipment | N:N | Campaign đẩy lên nhiều thiết bị mục tiêu |
| Equipment — WarrantyTicket | 1:N | 1 thiết bị có thể có nhiều lần báo lỗi |

---

## 6. State Machine — vòng đời từng thực thể

### 6.1. Order (Đơn hàng)

```
 draft ──gửi──▶ pending ──duyệt──▶ approved ──ký HĐ + giao──▶ delivering ──hoàn tất──▶ delivered
                   │                  │
                   └──từ chối──▶ cancelled ◀──huỷ──┘
```

### 6.2. Contract (Hợp đồng)

```
 draft ──ký──▶ signed ──kích hoạt──▶ active ──hết hạn──▶ expired
                                        │
                                        └──chấm dứt sớm──▶ terminated
```

### 6.3. WarrantyTicket (Ticket bảo hành)

```
 new ──tiếp nhận──▶ accepted ──cử KTV──▶ in_progress ──xong──▶ resolved ──nghiệm thu──▶ closed
   │                                          │
   └──từ chối──▶ rejected          chờ linh kiện──▶ awaiting_part ──có hàng──▶ in_progress
```

### 6.4. License (Giấy phép)

```
 issued (active) ──gần hết hạn (≤90 ngày)──▶ [expiring] ──quá hạn──▶ expired
        │                                         │
        └──thu hồi──▶ revoked              gia hạn──▶ issued (active)
```

---

## 7. Business Rules

| Mã | Business Rule |
|---|---|
| **BR-OP-01** | Đơn chỉ chuyển `delivering` khi Contract liên kết đã `active` |
| **BR-OP-02** | Mỗi đơn `approved` sinh đúng 1 Contract `draft` — không tạo trùng |
| **BR-OP-03** | License chỉ được cấp sau khi Contract `active` (không cấp trên đơn chưa duyệt) |
| **BR-OP-04** | Số seats license = Σ `seats` của `includedSoftware` trong gói đã mua |
| **BR-04** (kế thừa) | License luôn loại `per_user` ở V1 (BR có sẵn trong dự án) |
| **BR-OP-05** | Campaign bộ cài chỉ deploy lên `Equipment` thuộc trường có trong Contract |
| **BR-OP-06** | Campaign bộ cài phải gắn 1 `License` hợp lệ (chưa hết hạn) để kích hoạt phần mềm |
| **BR-OP-07** | Warranty chỉ tiếp nhận ticket cho thiết bị còn hạn (`warrantyEndsAt` ≥ hôm nay); hết hạn → chuyển luồng "sửa có phí" |
| **BR-OP-08** | Ticket `awaiting_part` không tính vào SLA xử lý (dừng đồng hồ SLA) |
| **BR-OP-09** | Hoa hồng đại lý = `baseRevenueVND` × `commissionPct` của Contract |
| **BR-OP-10** | Đơn `cancelled` sau khi đã có Contract → Contract phải chuyển `terminated` |
| **BR-OP-11** | Từ chối đơn / chấm dứt hợp đồng / thu hồi license **bắt buộc nhập lý do** |
| **BR-OP-12** | Chỉ `supplier_admin` được ký hợp đồng và phê duyệt cấp license |

---

## 8. Use Cases chính

| UC | Tên | Actor | Tiền điều kiện | Hậu điều kiện |
|---|---|---|---|---|
| UC-01 | Tạo đơn hàng thủ công | sales | — | Order `pending` |
| UC-02 | Duyệt / Từ chối đơn | sales, admin | Order `pending` | Order `approved` \| `cancelled` |
| UC-03 | Sinh hợp đồng từ đơn duyệt | sales | Order `approved` | Contract `draft` |
| UC-04 | Ký & kích hoạt hợp đồng | admin | Contract `draft`/`signed` | Contract `active` |
| UC-05 | Đánh dấu hoàn thành milestone | sales | Contract `active` | Milestone `done` |
| UC-06 | Cấp License theo hợp đồng | sales, admin | Contract `active` | License records mới |
| UC-07 | Tạo Campaign cài đặt bộ cài | sales | Có License + Equipment | InstallCampaign mới |
| UC-08 | Giao hàng → đơn delivered | sales | Contract `active` | Order `delivered` |
| UC-09 | Tiếp nhận & xử lý ticket bảo hành | warranty | Ticket `new` | Ticket `closed` |
| UC-10 | Gia hạn / Thu hồi License | sales, admin | License tồn tại | License `issued` \| `revoked` |
| UC-11 | Đối soát hoa hồng đại lý | finance, admin | Contract có đại lý | CommissionRecord `reconciled`/`paid` |

---

## 9. Edge Cases & Rủi ro

| # | Tình huống | Rủi ro | Hướng xử lý đề xuất |
|---|---|---|---|
| E1 | Huỷ đơn sau khi đã ký hợp đồng | Hợp đồng "mồ côi" | BR-OP-10: Contract → `terminated`, thu hồi license đã cấp |
| E2 | Trường chấm dứt HĐ giữa chừng | License/warranty còn hiệu lực | Thu hồi license, dừng warranty, đối soát hoàn tiền |
| E3 | License hết hạn nhưng trường vẫn dùng | Vi phạm cấp phép | Cảnh báo trước 90/30 ngày, khoá phần mềm khi hết hạn |
| E4 | Thiết bị giao thiếu/lỗi ngay khi nhận | Tranh chấp nghiệm thu | Tạo ticket bảo hành "lỗi ban đầu" — ưu tiên SLA |
| E5 | Đại lý tranh chấp hoa hồng | Mâu thuẫn tài chính | CommissionRecord status `disputed` → quy trình đối soát |
| E6 | Thiết bị hết hạn bảo hành mới báo lỗi | Chi phí sửa | BR-OP-07: chuyển luồng "báo giá sửa có phí" |
| E7 | Campaign cài đặt thất bại 1 phần | Thiết bị chưa có phần mềm | Retry per-device, log lỗi, không đóng campaign khi chưa 100% |
| E8 | 1 trường mua nhiều gói (nhiều đơn) | Gộp hợp đồng? | → Open Question Q2 |
| E9 | Đơn pending quá lâu không duyệt | Đọng đơn | Cảnh báo SLA duyệt đơn (VD > 3 ngày) |

---

## 10. Gap phân tích

### 10.1. Gap Data Model (cần bổ sung field)

| Thực thể | Field thiếu | Lý do cần |
|---|---|---|
| `License` | `contractId`, `orderId` | Truy nguồn license thuộc HĐ/đơn nào (BR-OP-03) |
| `License` | `status` rõ ràng | Hiện chỉ suy ra từ `revokedAt`/`expiresAt` — nên có enum |
| `Equipment` | `contractId` | Truy nguồn thiết bị giao theo HĐ nào (4a) |
| `InstallCampaign` | Chưa tồn tại trong mock-data | Đang tự sinh trong component — cần đưa vào data model thật |
| `InstallCampaign` | `licenseId`, `equipmentIds[]`, `contractId` | Bind bộ cài ↔ license ↔ thiết bị (BR-OP-05, 06) |
| `Order` | (đã có `contractId`) | Cần hiển thị & dùng — hiện UI bỏ qua |

### 10.2. Gap Module (chức năng thiếu hẳn)

| Gap | Mô tả | Mức độ |
|---|---|---|
| **Đối soát hoa hồng cho NCC** | NCC có `commissionRecords` nhưng không có UI đối soát trong nhóm Vận hành (chỉ Distributor có `CommissionReconciliation`) | Cao — UC-11 không thực hiện được |
| **Liên kết Order → Equipment** | Giao hàng phải sinh `Equipment` records cho trường — hiện không có | Cao |
| **Quy trình nghiệm thu** | Milestone "Nghiệm thu" cần biên bản — hiện milestone read-only | Trung bình |
| **Cảnh báo SLA duyệt đơn** | Đơn pending quá hạn không có cảnh báo (E9) | Thấp |

### 10.3. Gap Luồng (đã nêu ở review — tóm tắt)

5 luồng đứt: Duyệt đơn không đổi status · Duyệt đơn không sinh HĐ · Đơn delivered không cấp license/bộ cài · License không FK · Bộ cài không bind license/equipment.

---

## 11. Quyết định nghiệp vụ đã chốt (2026-05-20)

> Các câu hỏi nghiệp vụ đã được stakeholder trả lời — đây là cơ sở thiết kế chính thức.

### 11.1. Phạm vi V1 vs V2 — QUYẾT ĐỊNH NỀN TẢNG

| Giai đoạn | Mô hình kinh doanh |
|---|---|
| **V1 (hiện tại)** | Trường mua **trực tiếp** NCC. Trường có nhu cầu → team dự án (đội phát triển + nhà cung cấp) **đến khảo sát** → xây dựng & triển khai cho trường. **KHÔNG có đại lý.** |
| **V2 (tương lai)** | Phát triển **module Chợ (Marketplace)** — trường lên chợ tự mua. Khi đó mới có **đại lý ở các tỉnh** môi giới. |

→ **Hệ quả lớn cho V1:**
- Đơn hàng **không có đại lý** — `distributorTenantId` luôn rỗng ở V1
- Hợp đồng ký **2 bên** (NCC – Trường), **không có** `commissionPct`
- **KHÔNG có module Đối soát hoa hồng** cho NCC ở V1 (vì không có đại lý) → UC-11 dời sang V2
- Fulfillment có thêm bước **Khảo sát hiện trạng** trước khi triển khai (team đến trường khảo sát)

### 11.2. Bảng quyết định

| # | Câu hỏi | Quyết định |
|---|---|---|
| **Q1** | Kênh đặt hàng | **V1: Chỉ trực tiếp NCC↔Trường** (+ NCC tạo đơn thủ công). Đại lý/chợ → V2 |
| **Q2** | Order ↔ Contract | **1:1** — mỗi đơn duyệt sinh đúng 1 hợp đồng |
| **Q3** | Hợp đồng mấy bên | **V1: 2 bên** (NCC – Trường) |
| **Q4** | Cấp License | **Bán tự động** — đơn `delivered` → NCC bấm "Cấp license" → hệ thống sinh theo `includedSoftware` của gói. *(Chọn vì V1 quan hệ trực tiếp, NCC nắm toàn quyền kiểm soát fulfillment — bán tự động cân bằng giữa kiểm soát và tốc độ.)* |
| **Q5** | Bản chất bộ cài | Mô phỏng **đẩy từ xa** — prototype mock tiến độ cài đặt theo thiết bị |
| **Q6** | Thiết bị hết bảo hành | Luồng **"báo giá sửa có phí"** (không từ chối thẳng) |
| **Q7** | Đối soát hoa hồng | **Dời V2** — V1 không có đại lý nên không cần |
| **Q8** | Sinh Equipment khi giao | **Dời V2** — V1 dùng `equipment` mock có sẵn. *(Chọn vì V1 tập trung hoàn thiện xương sống thương mại Đơn→HĐ→License→Bộ cài; sinh Equipment + đồng bộ sang tenant Trường là tính năng cross-tenant phức tạp, hợp lý để V2.)* |

### 11.3. Scope V1 nhóm Vận hành sau khi chốt

```
✅ V1 — Làm:
   Đơn hàng (trực tiếp) · Hợp đồng 2 bên · Cấp License bán tự động
   · Bộ cài (mô phỏng remote) · Bảo hành (có nhánh hết hạn → có phí)
   · Liên hoàn: Duyệt đơn → sinh HĐ → cấp License → tạo Campaign

❌ V2 — Để sau:
   Module Chợ/Marketplace · Vai trò Đại lý trong đơn hàng
   · Đối soát hoa hồng · Sinh Equipment records khi giao hàng
```

---

## 12. Cập nhật mô hình theo quyết định V1

Các phần trong tài liệu này áp dụng cho V1 với điều chỉnh:

| Mục | Điều chỉnh cho V1 |
|---|---|
| §2 Actors | **Bỏ actor Đại lý** khỏi V1; bỏ "NCC Tài chính / đối soát hoa hồng" |
| §3 Quy trình | Bỏ nhánh "qua đại lý" — chỉ còn trực tiếp + NCC nhập thủ công |
| §4 GĐ1 | Form tạo đơn **không có** trường chọn đại lý |
| §4 GĐ3 | Hợp đồng 2 bên; milestone thêm **"Khảo sát hiện trạng"** (đầu danh sách) |
| §5 ERD | Bỏ nhánh `Contract ─ CommissionRecord` ở V1 |
| §7 BR | BR-OP-09 (hoa hồng) → V2; các BR khác giữ nguyên |
| §10.2 Gap | "Đối soát hoa hồng NCC" → V2, không tính là gap V1 |

---

## 13. Kết luận phân tích

Nhóm Vận hành hiện là **tập UI mockup rời rạc** (~42% hoàn thiện). Vấn đề cốt lõi **không phải thiếu màn hình** mà là **thiếu xương sống nghiệp vụ**: không có vòng đời thực thể, không có liên kết Đơn→HĐ→License→Bộ cài.

**Thứ tự ưu tiên khi triển khai (sau khi chốt Open Questions):**
1. **Xương sống dữ liệu** — bổ sung FK (License.contractId, InstallCampaign...) + state mutable
2. **Vòng đời + liên hoàn** — duyệt đơn → sinh HĐ → cấp license → tạo campaign
3. **Form tạo + validation** — 5 form còn thiếu
4. **Hoàn thiện nhánh phụ** — warranty nhánh phụ, nghiệm thu milestone, đối soát hoa hồng

→ Bước tiếp theo: **chốt 8 Open Questions**, sau đó lập `Operations-Completion-Plan.md` (kế hoạch kỹ thuật chi tiết).

---

**Hết tài liệu phân tích nghiệp vụ.**
